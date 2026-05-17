import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  changePassword: (data) => api.patch('/users/me/password', data),
  kakaoLogin: () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/kakao`;
  },
  naverLogin: () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/naver`;
  },
};
