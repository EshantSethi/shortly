package com.urlshortener.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.urlshortener.backend.model.ClickEvent;
import com.urlshortener.backend.model.UrlMapping;
import com.urlshortener.backend.repository.ClickEventRepository;
import com.urlshortener.backend.repository.UrlRepository;

@Service
public class UrlService {

    @Autowired
    private UrlRepository urlRepository;

    @Autowired
    private ClickEventRepository clickEventRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int SHORT_CODE_LENGTH = 6;

    public UrlMapping shortenUrl(String originalUrl, int expiryDays, String customCode) {
        if (originalUrl == null || originalUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("URL cannot be empty");
        }
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
        urlMapping.setCreatedAt(LocalDateTime.now());

        if (expiryDays > 0) {
            urlMapping.setExpiresAt(LocalDateTime.now().plusDays(expiryDays));
        }

        UrlMapping saved = urlRepository.save(urlMapping);

        redisTemplate.opsForValue().set(
            shortCode,
            originalUrl,
            expiryDays > 0 ? expiryDays : 30,
            TimeUnit.DAYS
        );

        return saved;
    }

    public Optional<String> getOriginalUrl(String shortCode) {
        String cachedUrl = redisTemplate.opsForValue().get(shortCode);
        if (cachedUrl != null) {
            incrementClickCount(shortCode);
            return Optional.of(cachedUrl);
        }

        Optional<UrlMapping> mapping = urlRepository.findByShortCode(shortCode);
        if (mapping.isPresent()) {
            UrlMapping urlMapping = mapping.get();

            if (urlMapping.getExpiresAt() != null &&
                urlMapping.getExpiresAt().isBefore(LocalDateTime.now())) {
                return Optional.empty();
            }

            redisTemplate.opsForValue().set(
                shortCode,
                urlMapping.getOriginalUrl(),
                30,
                TimeUnit.DAYS
            );

            incrementClickCount(shortCode);
            return Optional.of(urlMapping.getOriginalUrl());
        }

        return Optional.empty();
    }

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

    private void incrementClickCount(String shortCode) {
        urlRepository.findByShortCode(shortCode).ifPresent(mapping -> {
            mapping.setClickCount(mapping.getClickCount() + 1);
            urlRepository.save(mapping);
        });
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
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < SHORT_CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
