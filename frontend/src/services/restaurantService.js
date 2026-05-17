import api from './api';

export const restaurantService = {
  getList: (params) => api.get('/restaurants', { params }),
  getDetail: (id) => api.get(`/restaurants/${id}`),
  getNearby: (lat, lng, radius = 3) =>
    api.get('/restaurants/nearby', { params: { lat, lng, radius } }),
  getTopRated: () => api.get('/restaurants/top-rated'),
  create: (data) => api.post('/restaurants', data),
  getReviews: (id, params) => api.get(`/restaurants/${id}/reviews`, { params }),
  createReview: (id, data) => api.post(`/restaurants/${id}/reviews`, data),
  toggleBookmark: (id) => api.post(`/users/me/bookmarks/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
};
