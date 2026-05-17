import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';
import styles from './AccountSettings.module.css';

function AccountSettings() {
  const navigate = useNavigate();
  const { isLoggedIn, user, setUser } = useAuthStore();
  const [profileForm, setProfileForm] = useState({ nickname: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileMessageType, setProfileMessageType] = useState('success');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('success');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    authService.getMe()
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {});
  }, [isLoggedIn, navigate, setUser]);

  useEffect(() => {
    setProfileForm({
      nickname: user?.nickname ?? '',
      address: user?.address ?? '',
    });
  }, [user?.nickname, user?.address]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    const nickname = profileForm.nickname.trim();
    if (nickname.length < 2 || nickname.length > 20) {
      setProfileMessageType('error');
      setProfileMessage('닉네임은 2~20자로 입력해주세요.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await authService.updateMe({
        nickname,
        address: profileForm.address,
      });
      setUser(res.data);
      setProfileMessageType('success');
      setProfileMessage('계정정보가 저장되었습니다.');
    } catch (err) {
      setProfileMessageType('error');
      setProfileMessage(err.response?.data?.message || '계정정보 수정에 실패했습니다.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (user?.provider !== 'local') {
      setPasswordMessageType('error');
      setPasswordMessage('소셜 계정은 비밀번호를 변경할 수 없습니다.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessageType('error');
      setPasswordMessage('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessageType('error');
      setPasswordMessage('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessageType('success');
      setPasswordMessage('비밀번호가 변경되었습니다.');
    } catch (err) {
      setPasswordMessageType('error');
      setPasswordMessage(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className="page-title">계정정보 수정</h1>
        <button type="button" className="btn btn-outline" onClick={() => navigate('/mypage')}>
          마이페이지로
        </button>
      </div>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>프로필 정보</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input type="email" value={user?.email ?? ''} readOnly />
          </div>
          <div className="form-group">
            <label>닉네임</label>
            <input
              type="text"
              name="nickname"
              value={profileForm.nickname}
              onChange={handleProfileChange}
              minLength={2}
              maxLength={20}
              required
            />
          </div>
          <div className="form-group">
            <label>주소</label>
            <input
              type="text"
              name="address"
              value={profileForm.address}
              onChange={handleProfileChange}
              maxLength={500}
              placeholder="주소를 입력하세요"
            />
          </div>
          <p className={styles.providerLabel}>
            가입 방식: {user?.provider === 'kakao'
              ? '카카오'
              : user?.provider === 'naver'
                ? '네이버'
                : '이메일'}
          </p>
          {profileMessage && (
            <p className={profileMessageType === 'error' ? styles.error : styles.success}>
              {profileMessage}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? '저장 중...' : '정보 저장'}
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>비밀번호 변경</h2>
        {user?.provider !== 'local' ? (
          <p className={styles.muted}>
            소셜 계정(카카오/네이버)은 비밀번호 변경을 지원하지 않습니다.
          </p>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>현재 비밀번호</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                minLength={8}
                required
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호 (8자 이상)</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                minLength={8}
                required
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                minLength={8}
                required
              />
            </div>
            {passwordMessage && (
              <p className={passwordMessageType === 'error' ? styles.error : styles.success}>
                {passwordMessage}
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default AccountSettings;
