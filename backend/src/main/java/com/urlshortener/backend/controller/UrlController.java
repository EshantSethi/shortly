package com.urlshortener.backend.controller;

import com.urlshortener.backend.model.UrlMapping;
import com.urlshortener.backend.service.UrlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class UrlController {

    @Autowired
    private UrlService urlService;

    @PostMapping("/shorten")
    public ResponseEntity<?> shortenUrl(@RequestBody Map<String, Object> request) {
        String originalUrl = (String) request.get("originalUrl");
        int expiryDays = request.containsKey("expiryDays") ?
            (int) request.get("expiryDays") : 30;

        if (originalUrl == null || originalUrl.isEmpty()) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("error", "URL cannot be empty"));
        }

        if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
            originalUrl = "https://" + originalUrl;
        }

        UrlMapping saved = urlService.shortenUrl(originalUrl, expiryDays);
        return ResponseEntity.ok(Map.of(
            "shortCode", saved.getShortCode(),
            "shortUrl", "http://localhost:8080/api/r/" + saved.getShortCode(),
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
}