package com.Mat_Zip.Mat_Zip.domain.admin.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminUserUpdateRequest {
    private String role;
    private Boolean active;
}