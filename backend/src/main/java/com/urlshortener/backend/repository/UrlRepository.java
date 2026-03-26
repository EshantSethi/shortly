package com.urlshortener.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.urlshortener.backend.model.UrlMapping;

@Repository
public interface UrlRepository extends JpaRepository<UrlMapping, Long> {

    Optional<UrlMapping> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    // Atomic increment — avoids read-modify-write race condition
    @Modifying
    @Transactional
    @Query("UPDATE UrlMapping u SET u.clickCount = u.clickCount + 1 WHERE u.shortCode = :shortCode")
    void incrementClickCount(@Param("shortCode") String shortCode);

    // Only return non-expired URLs for stats
    @Query("SELECT u FROM UrlMapping u WHERE u.expiresAt IS NULL OR u.expiresAt > :now ORDER BY u.createdAt DESC")
    List<UrlMapping> findAllActive(@Param("now") LocalDateTime now);
}
