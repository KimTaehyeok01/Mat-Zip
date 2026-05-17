package com.Mat_Zip.Mat_Zip.domain.restaurant.service;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.UserRepository;
import com.Mat_Zip.Mat_Zip.domain.bookmark.repository.BookmarkRepository;
import com.Mat_Zip.Mat_Zip.domain.recent.RecentView;
import com.Mat_Zip.Mat_Zip.domain.recent.RecentViewRepository;
import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantRequest;
import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantResponse;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Category;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import com.Mat_Zip.Mat_Zip.domain.restaurant.repository.CategoryRepository;
import com.Mat_Zip.Mat_Zip.domain.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BookmarkRepository bookmarkRepository;
    private final RecentViewRepository recentViewRepository;

    public Page<RestaurantResponse> getRestaurants(Pageable pageable) {
        return restaurantRepository.findAll(pageable).map(RestaurantResponse::from);
    }

    public Page<RestaurantResponse> searchRestaurants(String keyword, Pageable pageable) {
        return restaurantRepository.searchByKeyword(keyword, pageable).map(RestaurantResponse::from);
    }

    public Page<RestaurantResponse> getByCategory(Long categoryId, Pageable pageable) {
        return restaurantRepository.findByCategoryId(categoryId, pageable).map(RestaurantResponse::from);
    }

    public Page<RestaurantResponse> getByFilters(String priceRange, String atmosphere, Long categoryId, Pageable pageable) {
        Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        return restaurantRepository.findByFilters(priceRange, atmosphere, categoryId, unsorted)
                .map(RestaurantResponse::from);
    }

    // 최근 조회 기록
    @Transactional
    public void recordRecentView(Long userId, Long restaurantId) {
        User user = userRepository.getReferenceById(userId);
        Restaurant restaurant = restaurantRepository.getReferenceById(restaurantId);
        recentViewRepository.findByUserIdAndRestaurantId(userId, restaurantId)
                .ifPresentOrElse(
                        rv -> rv.setViewedAt(LocalDateTime.now()),
                        () -> recentViewRepository.save(RecentView.builder()
                                .user(user).restaurant(restaurant)
                                .viewedAt(LocalDateTime.now()).build())
                );
    }

    public List<RestaurantResponse> getRecentViews(Long userId) {
        return recentViewRepository.findTop20ByUserIdOrderByViewedAtDesc(userId)
                .stream()
                .map(rv -> RestaurantResponse.from(rv.getRestaurant()))
                .toList();
    }

    public Page<RestaurantResponse> getNearby(BigDecimal lat, BigDecimal lng, double radiusKm, Pageable pageable) {
        Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        return restaurantRepository.findNearby(lat, lng, radiusKm, unsorted).map(RestaurantResponse::from);
    }

    public Page<RestaurantResponse> getTopRated(Pageable pageable) {
        return restaurantRepository.findByOrderByAverageRatingDesc(pageable).map(RestaurantResponse::from);
    }

    public RestaurantResponse getRestaurant(Long id, Long userId) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("식당을 찾을 수 없습니다."));
        boolean bookmarked = userId != null && bookmarkRepository.existsByUserIdAndRestaurantId(userId, id);
        RestaurantResponse base = RestaurantResponse.from(r);
        return RestaurantResponse.builder()
                .id(base.getId()).name(base.getName()).description(base.getDescription())
                .address(base.getAddress()).roadAddress(base.getRoadAddress())
                .latitude(base.getLatitude()).longitude(base.getLongitude())
                .phone(base.getPhone()).website(base.getWebsite()).openingHours(base.getOpeningHours())
                .categoryName(base.getCategoryName()).kakaoPlaceId(base.getKakaoPlaceId())
                .averageRating(base.getAverageRating()).reviewCount(base.getReviewCount())
                .imageUrls(base.getImageUrls()).bookmarked(bookmarked)
                .build();
    }

    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Category category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId()).orElse(null)
                : null;

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName()).description(request.getDescription())
                .address(request.getAddress()).roadAddress(request.getRoadAddress())
                .latitude(request.getLatitude()).longitude(request.getLongitude())
                .phone(request.getPhone()).website(request.getWebsite())
                .openingHours(request.getOpeningHours()).category(category)
                .kakaoPlaceId(request.getKakaoPlaceId()).createdBy(user)
                .build();

        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }
}
