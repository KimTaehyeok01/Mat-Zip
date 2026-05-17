package com.Mat_Zip.Mat_Zip.domain.restaurant.repository;

import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Page<Restaurant> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT r FROM Restaurant r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Restaurant> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 가격대 + 분위기 + 카테고리 복합 필터
    @Query(value = "SELECT * FROM restaurants r WHERE " +
                   "(:priceRange IS NULL OR r.price_range = :priceRange) AND " +
                   "(:atmosphere IS NULL OR r.atmosphere LIKE '%' || CAST(:atmosphere AS TEXT) || '%') AND " +
                   "(:categoryId IS NULL OR r.category_id = :categoryId) " +
                   "ORDER BY r.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM restaurants r WHERE " +
                        "(:priceRange IS NULL OR r.price_range = :priceRange) AND " +
                        "(:atmosphere IS NULL OR r.atmosphere LIKE '%' || CAST(:atmosphere AS TEXT) || '%') AND " +
                        "(:categoryId IS NULL OR r.category_id = :categoryId)",
           nativeQuery = true)
    Page<Restaurant> findByFilters(
            @Param("priceRange") String priceRange,
            @Param("atmosphere") String atmosphere,
            @Param("categoryId") Long categoryId,
            Pageable pageable);

    @Query(value = """
        SELECT * FROM restaurants
        WHERE (
            6371 * acos(
                cos(radians(:lat)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(latitude))
            )
        ) < :radiusKm
        ORDER BY (
            6371 * acos(
                cos(radians(:lat)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(latitude))
            )
        )
        """, nativeQuery = true)
    Page<Restaurant> findNearby(@Param("lat") BigDecimal lat,
                                @Param("lng") BigDecimal lng,
                                @Param("radiusKm") double radiusKm,
                                Pageable pageable);

    Page<Restaurant> findByOrderByAverageRatingDesc(Pageable pageable);

    // 관리자: 회원 탈퇴 시 해당 회원이 등록한 식당의 createdBy를 null로 처리
    @Modifying
    @Query("UPDATE Restaurant r SET r.createdBy = null WHERE r.createdBy.id = :userId")
    void clearCreatedByUserId(@Param("userId") Long userId);
}
