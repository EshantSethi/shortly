package com.urlshortener.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "click_events", indexes = {
    @Index(name = "idx_click_events_clicked_at", columnList = "clickedAt"),
    @Index(name = "idx_click_events_short_code", columnList = "shortCode")
})
public class ClickEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String shortCode;

    @Column(nullable = false)
    private LocalDateTime clickedAt;
}
