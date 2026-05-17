package com.Mat_Zip.Mat_Zip.domain.admin.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class AdminRestaurantRequest {

    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String address;

    private String roadAddress;

    @NotNull @DecimalMin("-90.0") @DecimalMax("90.0")
    private BigDecimal latitude;

    @NotNull @DecimalMin("-180.0") @DecimalMax("180.0")
    private BigDecimal longitude;

    private String phone;
    private String website;
    private String openingHours;
    private Long categoryId;
    private String kakaoPlaceId;

    // 가격대: CHEAP / NORMAL / EXPENSIVE
    private String priceRange;

    // 분위기 태그 (쉼표 구분): 예) "데이트,가족,혼밥"
    private String atmosphere;
}