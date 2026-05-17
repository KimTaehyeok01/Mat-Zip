package com.Mat_Zip.Mat_Zip.domain.restaurant.dto;

import com.Mat_Zip.Mat_Zip.domain.restaurant.entity.Restaurant;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter @Builder
public class RestaurantResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String roadAddress;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String website;
    private String openingHours;
    private String categoryName;
    private String kakaoPlaceId;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private List<String> imageUrls;
    private boolean bookmarked;
    private String priceRange;
    private String atmosphere;

    public static RestaurantResponse from(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .address(r.getAddress())
                .roadAddress(r.getRoadAddress())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .phone(r.getPhone())
                .website(r.getWebsite())
                .openingHours(r.getOpeningHours())
                .categoryName(r.getCategory() != null ? r.getCategory().getName() : null)
                .kakaoPlaceId(r.getKakaoPlaceId())
                .averageRating(r.getAverageRating())
                .reviewCount(r.getReviewCount())
                .imageUrls(r.getImages().stream().map(img -> img.getImageUrl()).toList())
                .bookmarked(false)
                .priceRange(r.getPriceRange())
                .atmosphere(r.getAtmosphere())
                .build();
    }
}
