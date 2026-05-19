import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import styles from './Auth.module.css';

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authService.login(form);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>로그인</button>
        </form>

        <div className={styles.divider}><span>또는</span></div>

        <div className={styles.socialBtns}>
          <button
            className={`btn ${styles.kakaoBtn}`}
            onClick={() => authService.kakaoLogin()}
          >
            카카오로 시작하기
          </button>
          <button
            className={`btn ${styles.naverBtn}`}
            onClick={() => authService.naverLogin()}
          >
            네이버로 시작하기
          </button>
        </div>

        <p className={styles.link}>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
