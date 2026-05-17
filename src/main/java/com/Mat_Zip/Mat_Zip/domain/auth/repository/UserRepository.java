package com.Mat_Zip.Mat_Zip.domain.auth.repository;

import com.Mat_Zip.Mat_Zip.domain.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
    boolean existsByNicknameAndIdNot(String nickname, Long id);

    // 관리자: 이메일 또는 닉네임으로 회원 검색
    Page<User> findByEmailContainingIgnoreCaseOrNicknameContainingIgnoreCase(
            String email, String nickname, Pageable pageable);
}
