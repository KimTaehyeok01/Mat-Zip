package com.Mat_Zip.Mat_Zip.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdatePasswordRequest {

    @NotBlank @Size(min = 8, max = 100)
    private String currentPassword;

    @NotBlank @Size(min = 8, max = 100)
    private String newPassword;
}
