# 🍽️ Mat-Zip (맛집)

> 나만의 맛집을 발견하고 공유하는 맛집 정보 플랫폼

## 📌 프로젝트 소개

Mat-Zip은 사용자가 직접 맛집을 등록하고, 리뷰를 작성하며, 북마크로 저장할 수 있는 맛집 정보 공유 서비스입니다.
카카오 지도 기반의 위치 정보와 GPS 방문 인증 시스템을 통해 신뢰도 높은 맛집 정보를 제공합니다.

---

## 🛠️ 기술 스택

### Backend
| 기술 | 버전 |
|------|------|
| Java | 21 |
| Spring Boot | 3.4.1 |
| Spring Security | - |
| Spring Data JPA | - |
| PostgreSQL (Supabase) | - |
| JWT (jjwt) | 0.12.6 |
| Lombok | - |

### Frontend
| 기술 | 버전 |
|------|------|
| React | 18.3.1 |
| React Router DOM | 6.23.1 |
| Zustand | 4.5.2 |
| Axios | 1.7.2 |

### 인프라 / 외부 서비스
- **Supabase** — PostgreSQL 호스팅
- **카카오 OAuth2** — 소셜 로그인
- **네이버 OAuth2** — 소셜 로그인

---

## ✨ 주요 기능

### 👤 인증
- 이메일/비밀번호 회원가입 및 로그인
- 카카오 / 네이버 소셜 로그인 (OAuth2)
- JWT Access Token + Refresh Token 방식

### 🍜 맛집
- 맛집 등록 / 수정 / 삭제
- 카테고리 (한식, 중식, 일식 등) 및 태그 필터링
- 가격대 (저렴 / 보통 / 비쌈) 분류
- 위도·경도 기반 지도 연동

### ⭐ 리뷰
- 별점(1~5점) 및 텍스트 리뷰 작성
- GPS 방문 인증 (500m 이내 접근 시 인증 마크)
- 영수증 사진 업로드
- 리뷰 작성/삭제 시 평균 별점 자동 갱신 (DB 트리거)

### 🔖 북마크 & 최근 조회
- 맛집 북마크 저장 / 해제
- 최근 조회한 맛집 목록 자동 기록

### 🔐 관리자
- 사용자 관리 (역할 변경, 계정 활성화/비활성화)
- 맛집 관리 (등록 / 수정 / 삭제)

---

## 📁 프로젝트 구조

```
Mat-Zip/
├── src/main/java/com/Mat_Zip/Mat_Zip/
│   ├── domain/
│   │   ├── auth/          # 인증 (User, JWT, OAuth2)
│   │   ├── restaurant/    # 맛집
│   │   ├── review/        # 리뷰
│   │   ├── bookmark/      # 북마크
│   │   ├── recent/        # 최근 조회
│   │   └── admin/         # 관리자
│   └── global/
│       ├── config/        # Security, CORS, JPA 설정
│       └── security/      # JWT, OAuth2 처리
├── src/main/resources/
│   ├── application.properties
│   ├── application-local.properties  # 로컬 환경변수 (gitignore)
│   └── db.sql             # DB 스키마 및 초기 데이터
└── frontend/              # React 프론트엔드
```

---

## ⚙️ 로컬 실행 방법

### 1. 환경변수 설정

`src/main/resources/application-local.properties.example`을 복사하여 `application-local.properties` 생성 후 값 입력:

```properties
DB_URL=jdbc:postgresql://<supabase-host>:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key

KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 2. DB 스키마 적용

Supabase SQL Editor에서 `src/main/resources/db.sql` 실행

### 3. 백엔드 실행

```bash
./gradlew bootRun
# http://localhost:8080
```

### 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm start
# http://localhost:3000
```

---

## 🗄️ DB 스키마 요약

```
users             # 사용자 (이메일/소셜 로그인)
refresh_tokens    # JWT Refresh Token
categories        # 음식 카테고리
restaurants       # 맛집
restaurant_images # 맛집 이미지
tags              # 태그 (혼밥 가능, 주차 가능 등)
restaurant_tags   # 맛집-태그 관계
reviews           # 리뷰 (GPS/영수증 인증 포함)
review_images     # 리뷰 이미지
review_likes      # 리뷰 좋아요
bookmarks         # 북마크
recent_views      # 최근 조회 기록
```

---

## 🔑 테스트 계정

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| test1@test.com | test1234! | 일반 사용자 |
| test2@test.com | test1234! | 일반 사용자 |
| admin@test.com | test1234! | 관리자 |

---

## 📄 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 재발급 |
| PATCH | `/api/users/me` | 내 계정정보(닉네임/주소) 수정 |
| PATCH | `/api/users/me/password` | 내 비밀번호 변경 |
| GET | `/api/restaurants` | 맛집 목록 조회 |
| POST | `/api/restaurants` | 맛집 등록 |
| GET | `/api/restaurants/{id}` | 맛집 상세 조회 |
| GET | `/api/reviews/{restaurantId}` | 리뷰 목록 |
| POST | `/api/reviews/{restaurantId}` | 리뷰 작성 |
| GET | `/api/bookmarks` | 북마크 목록 |
| POST | `/api/bookmarks/{restaurantId}` | 북마크 추가/해제 |
| GET | `/api/admin/users` | 사용자 관리 (관리자) |
