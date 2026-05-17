package com.Mat_Zip.Mat_Zip.domain.recent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface RecentViewRepository extends JpaRepository<RecentView, Long> {

    Optional<RecentView> findByUserIdAndRestaurantId(Long userId, Long restaurantId);

    // 최근 조회 목록 (최신순, 최대 20개)
    List<RecentView> findTop20ByUserIdOrderByViewedAtDesc(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RecentView rv WHERE rv.user.id = :userId AND rv.restaurant.id = :restaurantId")
    void deleteByUserIdAndRestaurantId(Long userId, Long restaurantId);

    // 관리자: 회원 탈퇴 또는 식당 삭제 시 최근 조회 일괄 삭제
    @Modifying
    @Transactional
    @Query("DELETE FROM RecentView rv WHERE rv.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RecentView rv WHERE rv.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
