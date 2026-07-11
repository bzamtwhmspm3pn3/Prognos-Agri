import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/profile/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, profileData) => {
  const response = await api.put(`/profile/${userId}`, profileData);
  return response.data;
};

export const uploadProfileImage = async (userId, formData) => {
  const response = await api.post(`/profile/${userId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('prognos_token');
  localStorage.removeItem('prognos_user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('prognos_token');
};
