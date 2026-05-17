import api from './api';

export const adminService = {
  // 회원 관리
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // 맛집 관리
  getRestaurants: (params) => api.get('/admin/restaurants', { params }),
  createRestaurant: (data) => api.post('/admin/restaurants', data),
  updateRestaurant: (id, data) => api.put(`/admin/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/admin/restaurants/${id}`),
};
