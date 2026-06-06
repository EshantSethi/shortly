package com.urlshortener.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urlshortener.backend.model.ClickEvent;
import com.urlshortener.backend.model.UrlMapping;
import com.urlshortener.backend.repository.ClickEventRepository;
import com.urlshortener.backend.repository.UrlRepository;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int SHORT_CODE_LENGTH = 6;
    // Reuse a single SecureRandom — thread-safe and cryptographically strong
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public UrlMapping shortenUrl(String originalUrl, int expiryDays, String customCode) {
        if (originalUrl == null || originalUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be empty");
        }
        originalUrl = originalUrl.trim();
        if (originalUrl.length() > 2000) {
            throw new IllegalArgumentException("URL is too long");
        }
        if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
            originalUrl = "https://" + originalUrl;
        }

        String shortCode;
        if (customCode != null && !customCode.trim().isEmpty()) {
            customCode = customCode.trim();
            if (!customCode.matches("[a-zA-Z0-9_-]{3,20}")) {
                throw new IllegalArgumentException("Custom alias must be 3–20 characters (letters, numbers, - or _)");
            }
            if (urlRepository.existsByShortCode(customCode)) {
                throw new IllegalArgumentException("That alias is already taken. Try another.");
            }
            shortCode = customCode;
        } else {
            shortCode = generateUniqueShortCode();
        }

        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(originalUrl);
        urlMapping.setShortCode(shortCode);
        urlMapping.setClickCount(0L);

        if (expiryDays > 0) {
            urlMapping.setExpiresAt(LocalDateTime.now().plusDays(expiryDays));
        }

        UrlMapping saved;
        try {
            saved = urlRepository.save(urlMapping);
        } catch (DataIntegrityViolationException e) {
            // Race condition: another request took this short code — retry with a new one
            urlMapping.setShortCode(generateUniqueShortCode());
            saved = urlRepository.save(urlMapping);
        }

        // Cache in Redis — permanent links get no TTL, expiring ones get exact TTL
        // Redis failure is non-fatal: DB is the source of truth
        try {
            if (expiryDays > 0) {
                redisTemplate.opsForValue().set(saved.getShortCode(), originalUrl, expiryDays, TimeUnit.DAYS);
            } else {
                redisTemplate.opsForValue().set(saved.getShortCode(), originalUrl);
            }
        } catch (Exception e) {
            // Redis unavailable — link is saved in DB, redirects will still work via DB fallback
        }

        return saved;
    }

    public Optional<String> getOriginalUrl(String shortCode) {
        // Try Redis first — fall back to DB if Redis is unavailable
        try {
            String cachedUrl = redisTemplate.opsForValue().get(shortCode);
            if (cachedUrl != null) {
                incrementClickCount(shortCode);
                return Optional.of(cachedUrl);
            }
        } catch (Exception e) {
            // Redis unavailable — proceed to DB lookup
        }

        Optional<UrlMapping> mapping = urlRepository.findByShortCode(shortCode);
        if (mapping.isPresent()) {
            UrlMapping urlMapping = mapping.get();

            if (urlMapping.getExpiresAt() != null &&
                urlMapping.getExpiresAt().isBefore(LocalDateTime.now())) {
                return Optional.empty();
            }

            // Re-cache with remaining TTL (or no TTL if permanent) — best-effort
            try {
                if (urlMapping.getExpiresAt() != null) {
                    long remainingDays = java.time.temporal.ChronoUnit.DAYS.between(
                        LocalDateTime.now(), urlMapping.getExpiresAt());
                    if (remainingDays > 0) {
                        redisTemplate.opsForValue().set(shortCode, urlMapping.getOriginalUrl(), remainingDays, TimeUnit.DAYS);
                    }
                } else {
                    redisTemplate.opsForValue().set(shortCode, urlMapping.getOriginalUrl());
                }
            } catch (Exception e) {
                // Redis unavailable — continue without caching
            }

            incrementClickCount(shortCode);
            return Optional.of(urlMapping.getOriginalUrl());
        }

        return Optional.empty();
    }

    // Returns ALL URLs (for dashboard management — includes expired so user can delete them)
    public List<UrlMapping> getAllUrls() {
        return urlRepository.findAll();
    }

    public void deleteUrl(Long id) {
        urlRepository.findById(id).ifPresent(mapping -> {
            redisTemplate.delete(mapping.getShortCode());
            urlRepository.deleteById(id);
        });
    }

    public List<Map<String, Object>> getClicksPerDay() {
        LocalDateTime since = LocalDateTime.now().minusDays(6);
        List<Object[]> rows = clickEventRepository.findClicksPerDaySince(since);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(Map.of("day", row[0].toString(), "count", row[1]));
        }
        return result;
    }

    // Atomic increment — no read-modify-write race condition
    private void incrementClickCount(String shortCode) {
        urlRepository.incrementClickCount(shortCode);
        ClickEvent event = new ClickEvent();
        event.setShortCode(shortCode);
        event.setClickedAt(LocalDateTime.now());
        clickEventRepository.save(event);
    }

    private String generateUniqueShortCode() {
        String shortCode;
        do {
            shortCode = generateShortCode();
        } while (urlRepository.existsByShortCode(shortCode));
        return shortCode;
    }

    private String generateShortCode() {
        StringBuilder sb = new StringBuilder(SHORT_CODE_LENGTH);
        for (int i = 0; i < SHORT_CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(SECURE_RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
