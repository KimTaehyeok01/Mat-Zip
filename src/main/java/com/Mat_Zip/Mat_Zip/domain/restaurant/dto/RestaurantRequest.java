package com.Mat_Zip.Mat_Zip.domain.restaurant.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class RestaurantRequest {

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
}
