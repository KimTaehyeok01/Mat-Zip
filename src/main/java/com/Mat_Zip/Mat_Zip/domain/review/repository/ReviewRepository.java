package com.Mat_Zip.Mat_Zip.domain.review.repository;

import com.Mat_Zip.Mat_Zip.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId, Pageable pageable);
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Review> findByRestaurantIdAndUserId(Long restaurantId, Long userId);
    boolean existsByRestaurantIdAndUserId(Long restaurantId, Long userId);

    // 관리자: 회원 탈퇴 시 해당 회원의 리뷰 일괄 삭제
    @Modifying
    @Query("DELETE FROM Review rv WHERE rv.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    // 관리자: 식당 삭제 시 해당 식당의 리뷰 일괄 삭제
    @Modifying
    @Query("DELETE FROM Review rv WHERE rv.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
