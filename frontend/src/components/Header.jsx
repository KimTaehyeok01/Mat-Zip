import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';
import styles from './Header.module.css';

function Header() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>🍽 맛집</Link>

        <nav className={styles.nav}>
          <Link to="/restaurants">맛집 탐색</Link>
        </nav>

        <div className={styles.actions}>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link to="/admin/users" className={styles.adminBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  관리자
                </Link>
              )}
              <Link to="/mypage" className={styles.userBtn}>
                <div className={styles.userAvatar}>
                  {user?.profileImage
                    ? <img src={user.profileImage} alt={user.nickname} className={styles.userAvatarImg} />
                    : <span className={styles.userAvatarInitial}>{user?.nickname?.[0]}</span>
                  }
                </div>
                <span className={styles.userName}>{user?.nickname ?? '내 정보'}</span>
                <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">로그인</Link>
              <Link to="/register" className="btn btn-primary">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
