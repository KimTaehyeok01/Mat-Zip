package com.Mat_Zip.Mat_Zip.domain.recent;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recent_views",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "restaurant_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecentView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;
}
