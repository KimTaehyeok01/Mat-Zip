import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import styles from './BottomNav.module.css';

function BottomNav() {
  const { isLoggedIn } = useAuthStore();

  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => isActive ? styles.itemActive : styles.item}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
        <span>홈</span>
      </NavLink>

      <NavLink to="/restaurants" className={({ isActive }) => isActive ? styles.itemActive : styles.item}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span>탐색</span>
      </NavLink>

      {isLoggedIn ? (
        <NavLink to="/mypage" className={({ isActive }) => isActive ? styles.itemActive : styles.item}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>마이페이지</span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={({ isActive }) => isActive ? styles.itemActive : styles.item}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span>로그인</span>
        </NavLink>
      )}
    </nav>
  );
}

export default BottomNav;
