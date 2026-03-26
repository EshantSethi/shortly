package com.urlshortener.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortener.backend.model.UrlMapping;
import com.urlshortener.backend.service.UrlService;

@RestController
@RequestMapping("/api")
public class UrlController {

    @Autowired
    private UrlService urlService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostMapping("/shorten")
    public ResponseEntity<?> shortenUrl(@RequestBody Map<String, Object> request) {
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
                .build();
        }

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Short URL not found or has expired"));
    }

    @GetMapping("/urls")
    public ResponseEntity<List<UrlMapping>> getAllUrls() {
        return ResponseEntity.ok(urlService.getAllUrls());
    }

    @DeleteMapping("/urls/{id}")
    public ResponseEntity<?> deleteUrl(@PathVariable Long id) {
        urlService.deleteUrl(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<List<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(urlService.getClicksPerDay());
    }
}
