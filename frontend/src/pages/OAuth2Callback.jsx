import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';

function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (!token) { navigate('/login'); return; }

    // 토큰 임시 저장 후 유저 정보 조회
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);

    authService.getMe()
      .then((res) => {
        setAuth(res.data, token, refreshToken);
        navigate('/');
      })
      .catch(() => navigate('/login'));
  }, [navigate, searchParams, setAuth]);

  return null;
}

export default OAuth2Callback;
