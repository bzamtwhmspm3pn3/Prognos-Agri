import { useState, useEffect } from 'react';
import { getDashboard } from '../../services/dashboardService';

export function usePrognosData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getDashboard();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh: loadData };
}
