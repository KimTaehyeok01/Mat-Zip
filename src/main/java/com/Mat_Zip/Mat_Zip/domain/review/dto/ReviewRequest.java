package com.Mat_Zip.Mat_Zip.domain.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
public class ReviewRequest {

    @NotNull @Min(1) @Max(5)
    private Short rating;

    private String content;

    private LocalDate visitDate;

    // GPS 인증용 (선택)
    private BigDecimal userLat;
    private BigDecimal userLng;
}
