package com.Mat_Zip.Mat_Zip.domain.auth.service;

import com.Mat_Zip.Mat_Zip.domain.auth.dto.AuthResponse;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.LoginRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.RegisterRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.UpdatePasswordRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.UpdateProfileRequest;
import com.Mat_Zip.Mat_Zip.domain.auth.dto.UserResponse;
import com.Mat_Zip.Mat_Zip.domain.auth.entity.RefreshToken;
import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.RefreshTokenRepository;
import com.Mat_Zip.Mat_Zip.domain.auth.repository.UserRepository;
import com.Mat_Zip.Mat_Zip.global.security.CustomUserDetails;
import com.Mat_Zip.Mat_Zip.global.security.JwtService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j // Lombok이 자동으로 log 필드를 생성해주는 어노테이션
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JdbcTemplate jdbcTemplate;
    private volatile boolean addressTableReady = false;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${app.server-url:http://localhost:8080}")
    private String serverUrl;

    @PostConstruct
    public void initializeAddressTable() {
        ensureAddressTableExists();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();
        return issueTokens(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = ((CustomUserDetails) auth.getPrincipal()).getUser();
        return issueTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다."));
        if (stored.isExpired()) {
            refreshTokenRepository.delete(stored);
            throw new IllegalArgumentException("만료된 리프레시 토큰입니다.");
        }
        return issueTokens(stored.getUser());
    }

    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfileImage(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        try {
            // 확장자 추출
            String originalFilename = file.getOriginalFilename();
            String ext = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";

            // 저장 경로
            String filename = UUID.randomUUID() + ext;
            Path uploadDir = Paths.get("uploads/profiles");
            Files.createDirectories(uploadDir);
            Files.copy(file.getInputStream(), uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            user.setProfileImage(serverUrl + "/uploads/profiles/" + filename);
            return toUserResponse(userRepository.save(user));
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    @Transactional
    public UserResponse resetProfileImage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 기존 파일 삭제 (로컬 저장 파일인 경우)
        String current = user.getProfileImage();
        if (current != null && current.contains("/uploads/profiles/")) {
            String filename = current.substring(current.lastIndexOf("/uploads/profiles/") + "/uploads/profiles/".length());
            Path filePath = Paths.get("uploads/profiles", filename);
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // 파일 삭제 실패해도 DB는 초기화 (파일이 없거나 권한 문제 등 발생 시 경고 로그만 남기고 계속 진행)
                log.warn("프로필 이미지 파일 삭제 실패 - userId: {}, path: {}, error: {}", userId, filePath, e.getMessage());
            }
        }

        user.setProfileImage(null);
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String nickname = request.getNickname().trim();
        if (userRepository.existsByNicknameAndIdNot(nickname, userId)) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        user.setNickname(nickname);
        upsertAddress(userId, request.getAddress());
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!"local".equals(user.getProvider()) || user.getPassword() == null) {
            throw new IllegalArgumentException("이메일 계정만 비밀번호를 변경할 수 있습니다.");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String normalizeAddress(String address) {
        if (address == null) return null;
        String trimmed = address.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private synchronized void ensureAddressTableExists() {
        if (addressTableReady) return;
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS user_addresses (
                user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                address VARCHAR(500),
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """);
        addressTableReady = true;
    }

    private String findAddressByUserId(Long userId) {
        ensureAddressTableExists();
        return jdbcTemplate.query(
                "SELECT address FROM user_addresses WHERE user_id = ?",
                rs -> rs.next() ? rs.getString("address") : null,
                userId
        );
    }

    private void upsertAddress(Long userId, String address) {
        ensureAddressTableExists();
        String normalizedAddress = normalizeAddress(address);
        if (normalizedAddress == null) {
            jdbcTemplate.update("DELETE FROM user_addresses WHERE user_id = ?", userId);
            return;
        }
        jdbcTemplate.update(
                """
                INSERT INTO user_addresses (user_id, address)
                VALUES (?, ?)
                ON CONFLICT (user_id)
                DO UPDATE SET
                    address = EXCLUDED.address,
                    updated_at = CURRENT_TIMESTAMP
                """,
                userId,
                normalizedAddress
        );
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.from(user, findAddressByUserId(user.getId()));
    }

    private AuthResponse issueTokens(User user) {
        String subject = user.getEmail() != null ? user.getEmail() : user.getProviderId();
        String accessToken = jwtService.generateAccessToken(user.getId(), subject);
        String rawRefreshToken = jwtService.generateRefreshToken(subject);

        refreshTokenRepository.deleteByUserId(user.getId());
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(rawRefreshToken)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000))
                .build());

        return AuthResponse.of(accessToken, rawRefreshToken, toUserResponse(user));
    }
}
