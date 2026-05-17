package com.Mat_Zip.Mat_Zip.domain.bookmark.service;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.UserRepository;
import com.Mat_Zip.Mat_Zip.domain.bookmark.entity.Bookmark;
import com.Mat_Zip.Mat_Zip.domain.bookmark.repository.BookmarkRepository;
import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantResponse;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import com.Mat_Zip.Mat_Zip.domain.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public void toggle(Long userId, Long restaurantId) {
        if (bookmarkRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            bookmarkRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
        } else {
            User user = userRepository.getReferenceById(userId);
            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new IllegalArgumentException("식당을 찾을 수 없습니다."));
            bookmarkRepository.save(Bookmark.builder().user(user).restaurant(restaurant).build());
        }
    }

    @Transactional(readOnly = true)
    public Page<RestaurantResponse> getBookmarks(Long userId, Pageable pageable) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(b -> {
                    RestaurantResponse r = RestaurantResponse.from(b.getRestaurant());
                    return RestaurantResponse.builder()
                            .id(r.getId()).name(r.getName()).description(r.getDescription())
                            .address(r.getAddress()).roadAddress(r.getRoadAddress())
                            .latitude(r.getLatitude()).longitude(r.getLongitude())
                            .phone(r.getPhone()).website(r.getWebsite()).openingHours(r.getOpeningHours())
                            .categoryName(r.getCategoryName()).kakaoPlaceId(r.getKakaoPlaceId())
                            .averageRating(r.getAverageRating()).reviewCount(r.getReviewCount())
                            .imageUrls(r.getImageUrls()).bookmarked(true)
                            .build();
                });
    }
}
