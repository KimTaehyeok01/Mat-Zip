import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import useAuthStore from '../store/authStore';
import styles from './Auth.module.css';

function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authService.register(form);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>비밀번호 (8자 이상)</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} minLength={8} required />
          </div>
          <div className="form-group">
            <label>닉네임</label>
            <input type="text" name="nickname" value={form.nickname} onChange={handleChange} minLength={2} maxLength={20} required />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>가입하기</button>
        </form>

        <p className={styles.link}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
