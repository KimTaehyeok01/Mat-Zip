package com.Mat_Zip.Mat_Zip.domain.auth.controller;

import com.Mat_Zip.Mat_Zip.domain.auth.dto.AuthResponse;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.LoginRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.RegisterRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.service.UserService;
import com.Mat_Zip.Mat_Zip.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.refresh(body.get("refreshToken")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails != null) {
            userService.logout(userDetails.getId());
        }
        return ResponseEntity.noContent().build();
    }
}
