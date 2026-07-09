import { useState, useCallback } from 'react';
import api from '../../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({ method, url, data, params });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro na requisição';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, params) => request('get', url, null, params), [request]);
  const post = useCallback((url, data) => request('post', url, data), [request]);
  const put = useCallback((url, data) => request('put', url, data), [request]);
  const del = useCallback((url) => request('delete', url), [request]);

  return { loading, error, get, post, put, del, request };
}
