import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import AccountSettings from './pages/AccountSettings';
import WriteReview from './pages/WriteReview';
import OAuth2Callback from './pages/OAuth2Callback';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';
import { useAuth } from './hooks/useAuth';
import { authService } from './services/authService';
import './App.css';

function App() {
  const { isLoggedIn, user, setAuth } = useAuth();

  // 페이지 새로고침 시 토큰은 있지만 user 정보가 없으면 다시 불러옴
  useEffect(() => {
    if (isLoggedIn && !user) {
      authService.getMe()
        .then((res) => {
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          setAuth(res.data, accessToken, refreshToken);
        })
        .catch(() => {});
    }
  }, [isLoggedIn, user, setAuth]);

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<RestaurantList />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/restaurants/:id/review" element={<WriteReview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/account" element={<AccountSettings />} />
            <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
          </Routes>
        </main>
        <Footer />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
