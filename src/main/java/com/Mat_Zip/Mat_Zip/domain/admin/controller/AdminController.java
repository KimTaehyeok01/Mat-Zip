package com.Mat_Zip.Mat_Zip.domain.admin.controller;

import com.Mat_Zip.Mat_Zip.domain.admin.dto.AdminRestaurantRequest;
import com.Mat_Zip.Mat_Zip.domain.admin.dto.AdminUserResponse;
import com.Mat_Zip.Mat_Zip.domain.admin.dto.AdminUserUpdateRequest;
import com.Mat_Zip.Mat_Zip.domain.admin.service.AdminService;
import com.Mat_Zip.Mat_Zip.domain.restaurant.dto.RestaurantResponse;
import com.Mat_Zip.Mat_Zip.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ===== 회원 관리 =====

    /**
     * 회원 목록 조회 (이메일·닉네임 검색 지원)
     * GET /admin/users?keyword=&page=0&size=20
     */
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getUsers(keyword, pageable));
    }

    /**
     * 특정 회원 상세 조회
     * GET /admin/users/{id}
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    /**
     * 회원 정보 수정 (역할 변경, 활성화/비활성화)
     * PATCH /admin/users/{id}
     * Body: { "role": "ROLE_ADMIN", "active": false }
     */
    @PatchMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    /**
     * 회원 탈퇴 처리 (연관 데이터 포함 완전 삭제)
     * DELETE /admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ===== 맛집 관리 =====

    /**
     * 맛집 목록 조회
     * GET /admin/restaurants?page=0&size=20
     */
    @GetMapping("/restaurants")
    public ResponseEntity<Page<RestaurantResponse>> getRestaurants(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getRestaurants(keyword, pageable));
    }

    /**
     * 특정 맛집 상세 조회
     * GET /admin/restaurants/{id}
     */
    @GetMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getRestaurant(id));
    }

    /**
     * 맛집 등록 (관리자)
     * POST /admin/restaurants
     */
    @PostMapping("/restaurants")
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody AdminRestaurantRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createRestaurant(request, userDetails.getId()));
    }

    /**
     * 맛집 정보 수정 (관리자)
     * PUT /admin/restaurants/{id}
     */
    @PutMapping("/restaurants/{id}")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody AdminRestaurantRequest request) {
        return ResponseEntity.ok(adminService.updateRestaurant(id, request));
    }

    /**
     * 맛집 삭제 (연관 리뷰·북마크·최근조회 포함 완전 삭제)
     * DELETE /admin/restaurants/{id}
     */
    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        adminService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }
}