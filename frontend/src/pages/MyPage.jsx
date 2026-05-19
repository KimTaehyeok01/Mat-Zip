import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import styles from './MyPage.module.css';

function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, setAuth } = useAuth();
  const [tab, setTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    api.get('/users/me/reviews').then((res) => setReviews(res.data.content || []));
    api.get('/users/me/bookmarks').then((res) => setBookmarks(res.data.content || []));
    api.get('/users/me/recent-views').then((res) => setRecentViews(res.data || []));
  }, [isLoggedIn, navigate]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제할까요?')) return;
    await api.delete(`/reviews/${reviewId}`);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetProfileImage = async () => {
    if (!window.confirm('기본 프로필로 변경할까요?')) return;
    setUploading(true);
    try {
      const res = await api.delete('/users/me/profile-image');
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      setAuth(res.data, token, refreshToken);
    } catch {
      alert('기본 프로필 변경에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.patch('/users/me/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // 스토어의 유저 정보 업데이트
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      setAuth(res.data, token, refreshToken);
    } catch {
      alert('사진 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.profile}>
        {/* 아바타 - 클릭하면 파일 선택 */}
        <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
          {user?.profileImage
            ? <img src={user.profileImage} alt={user.nickname} className={styles.avatar} />
            : <div className={styles.avatarDefault}>{user?.nickname?.[0]}</div>
          }
          <div className={styles.avatarOverlay}>
            {uploading ? '...' : '사진 변경'}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.profileTopRow}>
            <div className={styles.profileText}>
              <h1 className={styles.nickname}>{user?.nickname}</h1>
              <p className={styles.email}>{user?.email}</p>
              {user?.address && <p className={styles.address}>{user.address}</p>}
            </div>
            <button
              type="button"
              className={styles.accountSettingBtn}
              onClick={() => navigate('/mypage/account')}
            >
              계정정보 수정
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" className={styles.accountSettingIcon}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className={styles.profileMetaRow}>
            <span className={styles.provider}>
              {user?.provider === 'kakao' ? '카카오 계정'
                : user?.provider === 'naver' ? '네이버 계정'
                : '이메일 계정'}
            </span>
            {user?.profileImage && (
              <button
                className={styles.resetAvatarBtn}
                onClick={handleResetProfileImage}
                disabled={uploading}
              >
                기본 프로필로 변경
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={tab === 'reviews'     ? styles.activeTab : styles.tab} onClick={() => setTab('reviews')}>내 리뷰 ({reviews.length})</button>
        <button className={tab === 'bookmarks'   ? styles.activeTab : styles.tab} onClick={() => setTab('bookmarks')}>저장한 맛집 ({bookmarks.length})</button>
        <button className={tab === 'recentViews' ? styles.activeTab : styles.tab} onClick={() => setTab('recentViews')}>최근 조회 ({recentViews.length})</button>
      </div>

      {tab === 'reviews' && (
        <div className={styles.list}>
          {reviews.length === 0
            ? <p className={styles.empty}>아직 작성한 리뷰가 없어요.</p>
            : reviews.map((r) => (
                <ReviewCard key={r.id} review={r} onDelete={handleDeleteReview} currentUserId={user?.id} />
              ))
          }
        </div>
      )}

      {tab === 'bookmarks' && (
        <div className="restaurant-grid">
          {bookmarks.length === 0
            ? <p className={styles.empty}>저장한 맛집이 없어요.</p>
            : bookmarks.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
          }
        </div>
      )}

      {tab === 'recentViews' && (
        <div className="restaurant-grid">
          {recentViews.length === 0
            ? <p className={styles.empty}>최근 조회한 맛집이 없어요.</p>
            : recentViews.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
          }
        </div>
      )}
    </div>
  );
}

export default MyPage;
