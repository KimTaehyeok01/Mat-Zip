package com.Mat_Zip.Mat_Zip.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateProfileRequest {

    @NotBlank @Size(min = 2, max = 20)
    private String nickname;

    @Size(max = 500)
    private String address;
}
