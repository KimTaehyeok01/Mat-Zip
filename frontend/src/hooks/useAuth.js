import useAuthStore from '../store/authStore';

export function useAuth() {
  const { user, isLoggedIn, accessToken, setAuth, logout, setUser } = useAuthStore();
  return { user, isLoggedIn, accessToken, setAuth, logout, setUser };
}
