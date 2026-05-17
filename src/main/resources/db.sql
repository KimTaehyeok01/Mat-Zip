-- Mat-Zip Supabase Schema

-- ===========================
-- USERS & AUTH
-- ===========================

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL    PRIMARY KEY,                              -- 사용자 고유 ID (자동 증가)
    email         VARCHAR(255) UNIQUE,                                   -- 이메일 (소셜 로그인은 null 가능)
    password      VARCHAR(255),                                          -- BCrypt 암호화된 비밀번호 (소셜 로그인은 null)
    nickname      VARCHAR(100) NOT NULL,                                 -- 닉네임 (필수)
    profile_image VARCHAR(500),                                          -- 프로필 사진 URL (null이면 이니셜 기본 아바타 사용)
    role          VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',             -- 권한: ROLE_USER(일반) | ROLE_ADMIN(관리자)
    provider      VARCHAR(50)  NOT NULL DEFAULT 'local',                 -- 가입 경로: local(이메일) | kakao | naver
    provider_id   VARCHAR(255),                                          -- 소셜 로그인 고유 식별자 (local은 null)
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,                    -- 계정 활성화 여부 (탈퇴 시 false)
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,       -- 가입 일시
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,       -- 최근 정보 수정 일시
    CONSTRAINT uq_provider UNIQUE (provider, provider_id)               -- 동일 소셜 계정 중복 가입 방지
);

CREATE TABLE IF NOT EXISTS user_addresses (
    user_id    BIGINT       PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, -- 사용자 ID (1:1)
    address    VARCHAR(500),                                        -- 사용자 주소 (선택)
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP      -- 최근 수정 일시
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         BIGSERIAL    PRIMARY KEY,                                 -- 토큰 고유 ID
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 토큰 소유 사용자 (탈퇴 시 자동 삭제)
    token      VARCHAR(512) NOT NULL UNIQUE,                            -- JWT Refresh Token 값
    expires_at TIMESTAMP    NOT NULL,                                   -- 토큰 만료 일시
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP          -- 토큰 발급 일시
);

-- ===========================
-- RESTAURANT
-- ===========================

CREATE TABLE IF NOT EXISTS categories (
    id   BIGSERIAL    PRIMARY KEY,                                       -- 카테고리 고유 ID
    name VARCHAR(100) NOT NULL UNIQUE,                                   -- 카테고리명 (한식, 중식, 일식 등)
    icon VARCHAR(100)                                                    -- 프론트 아이콘 키워드
);

CREATE TABLE IF NOT EXISTS restaurants (
    id             BIGSERIAL      PRIMARY KEY,                           -- 식당 고유 ID
    name           VARCHAR(255)   NOT NULL,                              -- 식당명
    description    TEXT,                                                 -- 식당 소개 (긴 텍스트)
    address        VARCHAR(500)   NOT NULL,                              -- 지번 주소
    road_address   VARCHAR(500),                                         -- 도로명 주소
    latitude       DECIMAL(10, 8) NOT NULL,                             -- 위도 (GPS 좌표, 소수점 8자리)
    longitude      DECIMAL(11, 8) NOT NULL,                             -- 경도 (GPS 좌표, 소수점 8자리)
    phone          VARCHAR(20),                                          -- 전화번호
    website        VARCHAR(500),                                         -- 홈페이지 URL
    opening_hours  VARCHAR(500),                                         -- 영업시간 (예: 11:00 - 22:00)
    category_id    BIGINT         REFERENCES categories(id) ON DELETE SET NULL, -- 음식 카테고리 (삭제되면 null)
    kakao_place_id VARCHAR(100),                                         -- 카카오맵 장소 ID (외부 연동용)
    price_range    VARCHAR(20),                                          -- 가격대: CHEAP(1만원↓) | NORMAL(1~3만원) | EXPENSIVE(3만원↑)
    atmosphere     VARCHAR(255),                                         -- 분위기 태그 (쉼표 구분, 예: '데이트,가족,혼밥')
    average_rating DECIMAL(3, 2)  NOT NULL DEFAULT 0.00,                -- 평균 별점 (트리거로 자동 갱신)
    review_count   INT            NOT NULL DEFAULT 0,                    -- 리뷰 수 (트리거로 자동 갱신)
    created_by     BIGINT         REFERENCES users(id) ON DELETE SET NULL, -- 식당 등록한 사용자 (탈퇴해도 식당은 유지)
    created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- 식당 등록 일시
    updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP    -- 식당 정보 수정 일시
);

CREATE TABLE IF NOT EXISTS restaurant_images (
    id            BIGSERIAL    PRIMARY KEY,                              -- 이미지 고유 ID
    restaurant_id BIGINT       NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, -- 연결된 식당 (식당 삭제 시 이미지도 삭제)
    image_url     VARCHAR(500) NOT NULL,                                 -- 이미지 URL
    is_primary    BOOLEAN      NOT NULL DEFAULT FALSE,                   -- 대표 이미지 여부 (목록/상세에서 메인으로 표시)
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP        -- 이미지 등록 일시
);

CREATE TABLE IF NOT EXISTS tags (
    id   BIGSERIAL   PRIMARY KEY,                                        -- 태그 고유 ID
    name VARCHAR(50) NOT NULL UNIQUE                                     -- 태그명 (혼밥 가능, 주차 가능 등)
);

CREATE TABLE IF NOT EXISTS restaurant_tags (
    restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, -- 연결된 식당
    tag_id        BIGINT NOT NULL REFERENCES tags(id)        ON DELETE CASCADE, -- 연결된 태그
    PRIMARY KEY (restaurant_id, tag_id)                                 -- 식당-태그 중복 방지
);

-- ===========================
-- REVIEWS
-- ===========================

CREATE TABLE IF NOT EXISTS reviews (
    id                BIGSERIAL   PRIMARY KEY,                           -- 리뷰 고유 ID
    restaurant_id     BIGINT      NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE, -- 리뷰 대상 식당 (식당 삭제 시 리뷰도 삭제)
    user_id           BIGINT      NOT NULL REFERENCES users(id)    ON DELETE CASCADE, -- 리뷰 작성자 (탈퇴 시 리뷰도 삭제)
    rating            SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5), -- 별점 (1~5점)
    content           TEXT,                                              -- 리뷰 본문
    visit_date        DATE,                                              -- 방문 날짜
    visit_verified    BOOLEAN     NOT NULL DEFAULT FALSE,               -- GPS 방문 인증 여부 (500m 이내 접근 시 true)
    receipt_image     VARCHAR(500),                                      -- 영수증 사진 URL (업로드 시 저장)
    verification_type VARCHAR(20) NOT NULL DEFAULT 'NONE',              -- 인증 유형: NONE | GPS | RECEIPT | BOTH(GPS+영수증)
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- 리뷰 작성 일시
    updated_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- 리뷰 수정 일시
    CONSTRAINT uq_review UNIQUE (restaurant_id, user_id)                -- 한 식당에 유저당 리뷰 1개만 허용
);

CREATE TABLE IF NOT EXISTS review_images (
    id         BIGSERIAL    PRIMARY KEY,                                 -- 이미지 고유 ID
    review_id  BIGINT       NOT NULL REFERENCES reviews(id) ON DELETE CASCADE, -- 연결된 리뷰 (리뷰 삭제 시 이미지도 삭제)
    image_url  VARCHAR(500) NOT NULL,                                    -- 리뷰 첨부 이미지 URL
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP          -- 이미지 업로드 일시
);

CREATE TABLE IF NOT EXISTS review_likes (
    id         BIGSERIAL PRIMARY KEY,                                    -- 좋아요 고유 ID
    user_id    BIGINT    NOT NULL REFERENCES users(id)    ON DELETE CASCADE, -- 좋아요 누른 사용자
    review_id  BIGINT    NOT NULL REFERENCES reviews(id)  ON DELETE CASCADE, -- 좋아요 대상 리뷰
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,            -- 좋아요 누른 일시
    CONSTRAINT uq_review_like UNIQUE (user_id, review_id)               -- 같은 리뷰에 중복 좋아요 방지
);

-- ===========================
-- BOOKMARKS
-- ===========================

CREATE TABLE IF NOT EXISTS bookmarks (
    id            BIGSERIAL PRIMARY KEY,                                 -- 북마크 고유 ID
    user_id       BIGINT    NOT NULL REFERENCES users(id)        ON DELETE CASCADE, -- 북마크한 사용자
    restaurant_id BIGINT    NOT NULL REFERENCES restaurants(id)  ON DELETE CASCADE, -- 북마크 대상 식당 (식당 삭제 시 북마크도 삭제)
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,         -- 북마크 등록 일시
    CONSTRAINT uq_bookmark UNIQUE (user_id, restaurant_id)             -- 같은 식당 중복 북마크 방지
);

-- ===========================
-- RECENT VIEWS (최근 조회)
-- ===========================

CREATE TABLE IF NOT EXISTS recent_views (
    id            BIGSERIAL PRIMARY KEY,                                 -- 조회 기록 고유 ID
    user_id       BIGINT    NOT NULL REFERENCES users(id)        ON DELETE CASCADE, -- 조회한 사용자
    restaurant_id BIGINT    NOT NULL REFERENCES restaurants(id)  ON DELETE CASCADE, -- 조회한 식당 (식당 삭제 시 기록도 삭제)
    viewed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,         -- 마지막 조회 일시 (재방문 시 갱신)
    CONSTRAINT uq_recent_view UNIQUE (user_id, restaurant_id)           -- 동일 식당은 한 행으로 관리 (viewed_at만 갱신)
);

-- ===========================
-- INDEXES
-- ===========================

CREATE INDEX IF NOT EXISTS idx_restaurants_category   ON restaurants(category_id);      -- 카테고리별 조회 속도 향상
CREATE INDEX IF NOT EXISTS idx_restaurants_location   ON restaurants(latitude, longitude); -- 지도/거리 기반 조회 속도 향상
CREATE INDEX IF NOT EXISTS idx_restaurants_rating     ON restaurants(average_rating DESC); -- 별점 높은 순 정렬 속도 향상
CREATE INDEX IF NOT EXISTS idx_restaurants_price      ON restaurants(price_range);       -- 가격대 필터 속도 향상
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant     ON reviews(restaurant_id);         -- 식당별 리뷰 조회 속도 향상
CREATE INDEX IF NOT EXISTS idx_reviews_user           ON reviews(user_id);               -- 마이페이지 내 리뷰 조회 속도 향상
CREATE INDEX IF NOT EXISTS idx_bookmarks_user         ON bookmarks(user_id);             -- 마이페이지 북마크 조회 속도 향상
CREATE INDEX IF NOT EXISTS idx_recent_views_user      ON recent_views(user_id);          -- 마이페이지 최근 조회 목록 속도 향상
CREATE INDEX IF NOT EXISTS idx_recent_views_viewed_at ON recent_views(viewed_at DESC);   -- 최근 조회순 정렬 속도 향상
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user    ON refresh_tokens(user_id);        -- 로그아웃 시 토큰 삭제 속도 향상

-- ===========================
-- TRIGGER: 리뷰 작성/수정/삭제 시 평균 별점 자동 갱신
-- ===========================

CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants
    SET average_rating = (
            SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0.00)
            FROM reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        ),
        review_count = (
            SELECT COUNT(*) FROM reviews
            WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_insert_update ON reviews;
CREATE TRIGGER trg_review_insert_update
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

DROP TRIGGER IF EXISTS trg_review_delete ON reviews;
CREATE TRIGGER trg_review_delete
    AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- ===========================
-- SEED DATA (중복 방지)
-- ===========================

INSERT INTO categories (name, icon) VALUES
    ('한식',      'korean'),
    ('중식',      'chinese'),
    ('일식',      'japanese'),
    ('양식',      'western'),
    ('분식',      'snack'),
    ('카페',      'cafe'),
    ('패스트푸드', 'fastfood'),
    ('기타',      'other')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name) VALUES
    ('혼밥 가능'), ('단체 모임'), ('주차 가능'), ('반려동물 동반'),
    ('포장 가능'), ('배달 가능'), ('가성비'), ('분위기 좋음'),
    ('데이트'), ('야식')
ON CONFLICT (name) DO NOTHING;

-- ① 테스트 유저 (비밀번호: test1234! BCrypt 인코딩값)
INSERT INTO users (email, password, nickname, role, provider) VALUES
('test1@test.com', '$2a$12$gGGBsYtAFmIGpjXCBqbkuOqHF4e3bvbVGrta6LBUsK7GV3aZFq60S', '맛집헌터', 'ROLE_USER',  'local'),
('test2@test.com', '$2a$12$gGGBsYtAFmIGpjXCBqbkuOqHF4e3bvbVGrta6LBUsK7GV3aZFq60S', '미식가김씨', 'ROLE_USER', 'local'),
('admin@test.com', '$2a$12$gGGBsYtAFmIGpjXCBqbkuOqHF4e3bvbVGrta6LBUsK7GV3aZFq60S', '관리자',    'ROLE_ADMIN', 'local')
ON CONFLICT (email) DO NOTHING;

-- ② 식당 (price_range, atmosphere 포함)
INSERT INTO restaurants (name, description, address, road_address, latitude, longitude, phone, opening_hours, category_id, price_range, atmosphere, average_rating, review_count, created_by) VALUES
('진짜 원조 삼겹살', '30년 전통의 두툼한 삼겹살 전문점', '서울 마포구 합정동 123-4', '서울 마포구 양화로 45',    37.5491, 126.9147, '02-1234-5678', '11:00 - 22:00', 1, 'NORMAL',    '가족,친구모임',   4.50, 2, 1),
('오사카 라멘',       '진한 돈코츠 육수의 정통 일본 라멘',    '서울 강남구 역삼동 456-7', '서울 강남구 테헤란로 123', 37.5006, 127.0369, '02-2345-6789', '11:30 - 21:30', 3, 'CHEAP',     '혼밥',           4.00, 1, 2),
('홍콩반점',          '바삭한 탕수육과 짜장면 맛집',          '서울 송파구 잠실동 789-1', '서울 송파구 올림픽로 56',  37.5133, 127.1028, '02-3456-7890', '10:00 - 21:00', 2, 'CHEAP',     '가족,혼밥',      5.00, 1, 1),
('브런치카페 모닝',   '분위기 좋은 브런치 카페',              '서울 마포구 연남동 321-5', '서울 마포구 연남로 34',    37.5607, 126.9243, '02-4567-8901', '09:00 - 20:00', 6, 'NORMAL',    '데이트,친구모임', 4.50, 1, 2),
('엄마손 김치찌개',   '집밥 같은 김치찌개 백반집',            '서울 은평구 불광동 654-2', '서울 은평구 통일로 89',    37.6108, 126.9278, '02-5678-9012', '08:00 - 20:00', 1, 'CHEAP',     '혼밥,가족',      4.00, 1, 1)
ON CONFLICT DO NOTHING;

-- ③ 식당 이미지
INSERT INTO restaurant_images (restaurant_id, image_url, is_primary) VALUES
(1, 'https://picsum.photos/seed/r1/600/400', true),
(2, 'https://picsum.photos/seed/r2/600/400', true),
(3, 'https://picsum.photos/seed/r3/600/400', true),
(4, 'https://picsum.photos/seed/r4/600/400', true),
(5, 'https://picsum.photos/seed/r5/600/400', true)
ON CONFLICT DO NOTHING;

-- ④ 식당 태그
INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES
(1, 1), (1, 3), (1, 7),
(2, 1), (2, 5),
(3, 2), (3, 5), (3, 7),
(4, 8), (4, 9),
(5, 1), (5, 7)
ON CONFLICT DO NOTHING;

-- ⑤ 리뷰 (verification_type 포함)
INSERT INTO reviews (restaurant_id, user_id, rating, content, visit_date, visit_verified, verification_type) VALUES
(1, 2, 5, '고기가 두툼하고 신선해요! 사장님도 친절하고 또 올게요.',  '2026-04-20', false, 'NONE'),
(1, 1, 4, '맛있는데 웨이팅이 좀 있어요. 그래도 기다릴 만합니다.',   '2026-04-22', false, 'NONE'),
(2, 1, 4, '육수가 진하고 면발이 쫄깃해요. 일본 현지 느낌!',         '2026-04-18', false, 'NONE'),
(3, 2, 5, '탕수육이 진짜 맛있어요. 바삭함이 오래 유지됩니다.',       '2026-04-25', false, 'NONE'),
(4, 1, 4, '분위기가 너무 좋아요. 브런치 메뉴도 다양합니다.',         '2026-04-26', false, 'NONE'),
(5, 2, 4, '진짜 집밥 느낌. 가격도 착하고 양도 많아요.',             '2026-04-27', false, 'NONE')
ON CONFLICT DO NOTHING;

-- ⑥ 북마크
INSERT INTO bookmarks (user_id, restaurant_id) VALUES
(1, 2), (1, 3),
(2, 1), (2, 4)
ON CONFLICT DO NOTHING;

-- ===========================
-- 관리자 계정 생성 방법
-- ===========================
-- 회원가입 후 아래 쿼리로 관리자로 승격:
-- UPDATE users SET role = 'ROLE_ADMIN' WHERE email = '관리자이메일@example.com';
