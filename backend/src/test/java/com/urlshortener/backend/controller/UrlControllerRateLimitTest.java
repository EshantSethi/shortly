package com.urlshortener.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;

/**
 * Plain unit tests for {@link UrlController}'s sliding-window rate limiter.
 *
 * <p>No Spring context, Redis or PostgreSQL is required: the controller is constructed
 * directly (the {@code UrlService} dependency is unused by {@code isRateLimited}) and the
 * time-injectable {@code isRateLimited(ip, limit, now)} overload is called so window
 * behaviour can be exercised deterministically without a real 60-second wait.
 */
class UrlControllerRateLimitTest {

    private static final int WRITE_LIMIT = 20;
    private static final int READ_LIMIT = 60;
    private static final long WINDOW_MS = 60_000L;

    private UrlController newController() {
        return new UrlController(null);
    }

    @Test
    void allowsExactlyLimitRequestsWithinWindowThenBlocks() {
        UrlController controller = newController();
        long now = 1_000_000L;

        for (int i = 0; i < WRITE_LIMIT; i++) {
            assertThat(controller.isRateLimited("1.1.1.1", WRITE_LIMIT, now))
                    .as("request %d of %d within the window should pass", i + 1, WRITE_LIMIT)
                    .isFalse();
        }

        assertThat(controller.isRateLimited("1.1.1.1", WRITE_LIMIT, now))
                .as("request %d should be blocked", WRITE_LIMIT + 1)
                .isTrue();
    }

    /**
     * Regression test for the fail-open bug: the old code removed the deque from the map
     * whenever the window emptied and then wrote the new timestamp to a detached deque, so
     * counts were lost and a client pacing requests across window boundaries never
     * exhausted its budget. This test fails against the old code and passes against the fix.
     */
    @Test
    void countsFromScratchAfterWindowExpiresAndCannotBeBypassedByPacing() {
        UrlController controller = newController();
        String ip = "2.2.2.2";
        long start = 5_000_000L;

        // Window 1: exactly the limit is allowed, the next request is blocked.
        for (int i = 0; i < WRITE_LIMIT; i++) {
            assertThat(controller.isRateLimited(ip, WRITE_LIMIT, start)).isFalse();
        }
        assertThat(controller.isRateLimited(ip, WRITE_LIMIT, start)).isTrue();

        // Advance just past the window: the budget resets and the limit is enforced again
        // from scratch (not fail-open, and not stuck permanently blocked).
        long secondWindow = start + WINDOW_MS + 1;
        for (int i = 0; i < WRITE_LIMIT; i++) {
            assertThat(controller.isRateLimited(ip, WRITE_LIMIT, secondWindow)).isFalse();
        }
        assertThat(controller.isRateLimited(ip, WRITE_LIMIT, secondWindow)).isTrue();

        // Pace requests one-per-window-plus-a-bit across many boundaries. Each fresh window
        // must allow exactly the limit and block the overflow — the client can never exceed
        // the limit by straddling boundaries.
        long now = secondWindow;
        for (int window = 0; window < 5; window++) {
            now += WINDOW_MS + 1;
            for (int i = 0; i < WRITE_LIMIT; i++) {
                assertThat(controller.isRateLimited(ip, WRITE_LIMIT, now))
                        .as("window %d request %d should pass", window, i + 1)
                        .isFalse();
            }
            assertThat(controller.isRateLimited(ip, WRITE_LIMIT, now))
                    .as("window %d overflow request should be blocked", window)
                    .isTrue();
        }
    }

    @Test
    void readAndWriteLimitsAreTrackedIndependentlyForSameIp() {
        UrlController controller = newController();
        String ip = "3.3.3.3";
        long now = 2_000_000L;

        // Exhaust the write budget (20) for this IP.
        for (int i = 0; i < WRITE_LIMIT; i++) {
            assertThat(controller.isRateLimited(ip, WRITE_LIMIT, now)).isFalse();
        }
        assertThat(controller.isRateLimited(ip, WRITE_LIMIT, now)).isTrue();

        // The read budget (60) for the same IP is a separate key and is untouched.
        for (int i = 0; i < READ_LIMIT; i++) {
            assertThat(controller.isRateLimited(ip, READ_LIMIT, now))
                    .as("read request %d should still pass despite writes being exhausted", i + 1)
                    .isFalse();
        }
        assertThat(controller.isRateLimited(ip, READ_LIMIT, now))
                .as("read request %d should be blocked", READ_LIMIT + 1)
                .isTrue();
    }

    @Test
    void differentIpsHaveIndependentBudgets() {
        UrlController controller = newController();
        long now = 3_000_000L;

        // Exhaust the budget for IP A.
        for (int i = 0; i < WRITE_LIMIT; i++) {
            assertThat(controller.isRateLimited("10.0.0.1", WRITE_LIMIT, now)).isFalse();
        }
        assertThat(controller.isRateLimited("10.0.0.1", WRITE_LIMIT, now)).isTrue();

        // IP B is unaffected and gets its own full budget.
        for (int i = 0; i < WRITE_LIMIT; i++) {
            assertThat(controller.isRateLimited("10.0.0.2", WRITE_LIMIT, now))
                    .as("IP B request %d should pass", i + 1)
                    .isFalse();
        }
        assertThat(controller.isRateLimited("10.0.0.2", WRITE_LIMIT, now)).isTrue();
    }

    @Test
    void concurrentRequestsFromOneIpNeverExceedLimit() throws InterruptedException {
        UrlController controller = newController();
        String ip = "4.4.4.4";
        long now = 4_000_000L; // fixed instant so nothing expires mid-test

        int threads = 16;
        int attemptsPerThread = 50; // 800 total attempts, far more than the limit
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);
        AtomicInteger allowed = new AtomicInteger();

        for (int t = 0; t < threads; t++) {
            pool.submit(() -> {
                try {
                    start.await();
                    for (int i = 0; i < attemptsPerThread; i++) {
                        if (!controller.isRateLimited(ip, WRITE_LIMIT, now)) {
                            allowed.incrementAndGet();
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();
                }
            });
        }

        start.countDown();
        assertThat(done.await(10, TimeUnit.SECONDS)).isTrue();
        pool.shutdownNow();

        assertThat(allowed.get())
                .as("no more than the limit may ever be allowed through concurrently")
                .isEqualTo(WRITE_LIMIT);
    }

    @Test
    void cleanupRemovesFullyExpiredEntriesButKeepsActiveOnes() throws Exception {
        UrlController controller = newController();
        long now = System.currentTimeMillis();

        // One active IP (recent timestamp) and one stale IP (well outside the window).
        controller.isRateLimited("active-ip", WRITE_LIMIT, now);
        controller.isRateLimited("stale-ip", WRITE_LIMIT, now - (WINDOW_MS * 10));

        controller.cleanupRateLimitMap();

        ConcurrentHashMap<String, ?> map = rateLimitMap(controller);
        assertThat(map).containsKey("active-ip:" + WRITE_LIMIT);
        assertThat(map).doesNotContainKey("stale-ip:" + WRITE_LIMIT);
    }

    @SuppressWarnings("unchecked")
    private static ConcurrentHashMap<String, ?> rateLimitMap(UrlController controller) throws Exception {
        var field = UrlController.class.getDeclaredField("rateLimitMap");
        field.setAccessible(true);
        return (ConcurrentHashMap<String, ?>) field.get(controller);
    }
}
