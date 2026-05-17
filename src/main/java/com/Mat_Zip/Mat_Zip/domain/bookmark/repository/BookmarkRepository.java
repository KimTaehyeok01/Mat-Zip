package com.Mat_Zip.Mat_Zip.domain.bookmark.repository;

import com.Mat_Zip.Mat_Zip.domain.bookmark.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Page<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Bookmark> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
    boolean existsByUserIdAndRestaurantId(Long userId, Long restaurantId);
    void deleteByUserIdAndRestaurantId(Long userId, Long restaurantId);

    // 관리자: 회원 탈퇴 또는 식당 삭제 시 북마크 일괄 삭제
    void deleteByUserId(Long userId);
    void deleteByRestaurantId(Long restaurantId);
}
