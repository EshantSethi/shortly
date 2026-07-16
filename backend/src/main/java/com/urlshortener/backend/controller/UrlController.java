package com.urlshortener.backend.controller;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortener.backend.model.UrlMapping;
import com.urlshortener.backend.service.UrlService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.rate-limit.requests-per-minute:20}")
    private int rateLimitRpm;

    // Separate higher limit for read endpoints (dashboard use)
    private static final int READ_LIMIT_RPM = 60;

    private static final long WINDOW_MS = 60_000L;

    private final ConcurrentHashMap<String, Deque<Long>> rateLimitMap = new ConcurrentHashMap<>();

    private boolean isRateLimited(String ip, int limit) {
        return isRateLimited(ip, limit, Instant.now().toEpochMilli());
    }

    /**
     * Sliding-window rate limiter. Returns true when the caller should be blocked (429).
     *
     * <p>Package-private and time-injectable so it can be unit tested deterministically
     * without a Spring context or a real 60-second wall-clock wait. Production callers use
     * the {@code isRateLimited(ip, limit)} overload, which supplies {@code Instant.now()}.
     */
    boolean isRateLimited(String ip, int limit, long now) {
        String key = ip + ":" + limit;
        // Atomically fetch-or-create the deque so every thread for a given key shares the
        // same instance (and therefore the same monitor). Never remove it here.
        Deque<Long> timestamps = rateLimitMap.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= limit) {
                return true;
            }
            timestamps.addLast(now);
            return false;
        }
    }

    /**
     * Periodically drops map entries whose sliding windows have fully expired, so the map
     * does not grow without bound as new IPs appear. Synchronizes on each deque before
     * deciding to remove it, so an entry that another thread is concurrently writing to is
     * never dropped.
     */
    @Scheduled(fixedRate = 300_000L) // every 5 minutes
    void cleanupRateLimitMap() {
        long now = Instant.now().toEpochMilli();
        rateLimitMap.entrySet().removeIf(entry -> {
            Deque<Long> timestamps = entry.getValue();
            synchronized (timestamps) {
                while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                    timestamps.pollFirst();
                }
                return timestamps.isEmpty();
            }
        });
    }

    private String clientIp(HttpServletRequest req) {
        return Optional.ofNullable(req.getHeader("X-Forwarded-For"))
                .map(h -> h.split(",")[0].trim())
                .orElse(req.getRemoteAddr());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @PostMapping("/shorten")
    public ResponseEntity<?> shortenUrl(@RequestBody Map<String, Object> request,
                                        HttpServletRequest httpRequest) {
        if (isRateLimited(clientIp(httpRequest), rateLimitRpm)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Too many requests. Please wait a moment and try again."));
        }

        String originalUrl = (String) request.get("originalUrl");
        int expiryDays = request.containsKey("expiryDays") ? (int) request.get("expiryDays") : 30;
        String customCode = (String) request.get("customCode");

        if (originalUrl == null || originalUrl.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL cannot be empty"));
        }

        UrlMapping saved = urlService.shortenUrl(originalUrl, expiryDays, customCode);
        return ResponseEntity.ok(Map.of(
            "shortCode", saved.getShortCode(),
            "shortUrl", baseUrl + "/api/r/" + saved.getShortCode(),
            "originalUrl", saved.getOriginalUrl(),
            "expiresAt", saved.getExpiresAt() != null ? saved.getExpiresAt().toString() : "Never"
        ));
    }

    @GetMapping("/r/{shortCode}")
    public ResponseEntity<?> redirect(@PathVariable String shortCode) {
        Optional<String> originalUrl = urlService.getOriginalUrl(shortCode);

        if (originalUrl.isPresent()) {
            return ResponseEntity
                .status(HttpStatus.FOUND)
                .header("Location", originalUrl.get())
                // Prevent browsers from caching redirects — ensures expired links stop working immediately
                .header("Cache-Control", "no-store, no-cache, must-revalidate")
                .header("Pragma", "no-cache")
                .build();
        }

        return ResponseEntity
            .status(HttpStatus.FOUND)
            .location(URI.create(frontendUrl + "/link-not-found"))
            .header("Cache-Control", "no-store")
            .build();
    }

    @GetMapping("/urls")
    public ResponseEntity<List<UrlMapping>> getAllUrls(HttpServletRequest httpRequest) {
        if (isRateLimited(clientIp(httpRequest), READ_LIMIT_RPM)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(urlService.getAllUrls());
    }

    @DeleteMapping("/urls/{id}")
    public ResponseEntity<?> deleteUrl(@PathVariable Long id, HttpServletRequest httpRequest) {
        if (isRateLimited(clientIp(httpRequest), rateLimitRpm)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Too many requests. Please slow down."));
        }
        urlService.deleteUrl(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<List<Map<String, Object>>> getAnalytics(HttpServletRequest httpRequest) {
        if (isRateLimited(clientIp(httpRequest), READ_LIMIT_RPM)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        return ResponseEntity.ok(urlService.getClicksPerDay());
    }
}
