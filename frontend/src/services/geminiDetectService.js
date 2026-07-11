import api from './api';

export const detectWithGemini = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await api.post('/detection/gemini-detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  });
  return response.data;
};
