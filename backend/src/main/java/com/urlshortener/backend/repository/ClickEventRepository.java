package com.urlshortener.backend.repository;

import com.urlshortener.backend.model.ClickEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {

    @Query(value = "SELECT DATE(clicked_at) as day, COUNT(*) as count " +
                   "FROM click_events WHERE clicked_at >= :since " +
                   "GROUP BY DATE(clicked_at) ORDER BY DATE(clicked_at)",
           nativeQuery = true)
    List<Object[]> findClicksPerDaySince(@Param("since") LocalDateTime since);
}
