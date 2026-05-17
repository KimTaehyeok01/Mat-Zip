package com.Mat_Zip.Mat_Zip.domain.admin.service;

import com.Mat_Zip.Mat_Zip.domain.admin.dto.AdminRestaurantRequest;
import com.Mat_Zip.Mat_Zip.domain.admin.dto.AdminUserResponse;
import com.Mat_Zip.Mat_Zip.domain.admin.dto.AdminUserUpdateRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.RefreshTokenRepository;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.UserRepository;
import com.Mat_Zip.Mat_Zip.domain.bookmark.repository.BookmarkRepository;
import com.Mat_Zip.Mat_Zip.domain.recent.RecentViewRepository;
import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantResponse;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Category;
import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import com.Mat_Zip.Mat_Zip.domain.restaurant.repository.CategoryRepository;
import com.Mat_Zip.Mat_Zip.domain.restaurant.repository.RestaurantRepository;
import com.Mat_Zip.Mat_Zip.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BookmarkRepository bookmarkRepository;
    private final RecentViewRepository recentViewRepository;
    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;

    // ===== 회원 관리 =====

    public Page<AdminUserResponse> getUsers(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return userRepository.findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(
                    keyword, keyword, pageable).map(AdminUserResponse::from);
        }
        return userRepository.findAll(pageable).map(AdminUserResponse::from);
    }

    public AdminUserResponse getUser(Long userId) {
        return AdminUserResponse.from(userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다.")));
    }

    @Transactional
    public AdminUserResponse updateUser(Long userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 이 사용자가 등록한 식당의 createdBy를 null로 처리
        restaurantRepository.clearCreatedByUserId(userId);

        // 연관 데이터 순서대로 삭제
        refreshTokenRepository.deleteByUserId(userId);
        reviewRepository.deleteByUserId(userId);
        bookmarkRepository.deleteByUserId(userId);
        recentViewRepository.deleteByUserId(userId);

        userRepository.deleteById(userId);
    }

    // ===== 맛집 관리 =====

    public Page<RestaurantResponse> getRestaurants(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return restaurantRepository.searchByKeyword(keyword, pageable).map(RestaurantResponse::from);
        }
        return restaurantRepository.findAll(pageable).map(RestaurantResponse::from);
    }

    public RestaurantResponse getRestaurant(Long restaurantId) {
        return RestaurantResponse.from(restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("식당을 찾을 수 없습니다.")));
    }

    @Transactional
    public RestaurantResponse createRestaurant(AdminRestaurantRequest request, Long adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Category category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId()).orElse(null)
                : null;

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .roadAddress(request.getRoadAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .website(request.getWebsite())
                .openingHours(request.getOpeningHours())
                .category(category)
                .kakaoPlaceId(request.getKakaoPlaceId())
                .priceRange(request.getPriceRange())
                .atmosphere(request.getAtmosphere())
                .createdBy(admin)
                .build();

        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    @Transactional
    public RestaurantResponse updateRestaurant(Long restaurantId, AdminRestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("식당을 찾을 수 없습니다."));
        Category category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId()).orElse(null)
                : null;

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setRoadAddress(request.getRoadAddress());
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
        restaurant.setPhone(request.getPhone());
        restaurant.setWebsite(request.getWebsite());
        restaurant.setOpeningHours(request.getOpeningHours());
        restaurant.setCategory(category);
        restaurant.setKakaoPlaceId(request.getKakaoPlaceId());
        restaurant.setPriceRange(request.getPriceRange());
        restaurant.setAtmosphere(request.getAtmosphere());

        return RestaurantResponse.from(restaurantRepository.save(restaurant));
    }

    @Transactional
    public void deleteRestaurant(Long restaurantId) {
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("식당을 찾을 수 없습니다."));

        // 연관 데이터 순서대로 삭제 (FK 제약 방지)
        reviewRepository.deleteByRestaurantId(restaurantId);
        bookmarkRepository.deleteByRestaurantId(restaurantId);
        recentViewRepository.deleteByRestaurantId(restaurantId);

        restaurantRepository.deleteById(restaurantId);
    }
}