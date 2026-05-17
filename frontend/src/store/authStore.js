import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isLoggedIn: !!localStorage.getItem('accessToken'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, isLoggedIn: false });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
