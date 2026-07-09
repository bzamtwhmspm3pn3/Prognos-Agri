// ⚠️ VERSÃO DE EMERGÊNCIA PARA APRESENTAÇÃO
// URL fixa do Python (funciona independentemente de variáveis de ambiente)
const PYTHON_API_URL = 'https://agrookuvanja-python.onrender.com';

/**
 * Verifica saúde do serviço Python
 */
export const checkPythonHealth = async () => {
  try {
    const response = await fetch(`${PYTHON_API_URL}/health`);
    const data = await response.json();
    return { 
      status: data.status === 'healthy' ? 'online' : 'offline',
      model_loaded: data.model_loaded,
      online: data.status === 'healthy'
    };
  } catch (error) {
    console.error('Erro no health check:', error);
    return { status: 'offline', model_loaded: false, online: false };
  }
};

/**
 * Deteta pragas na imagem
 */
export const detectPestFromImage = async (imageFile, confThreshold = 0.7) => {
  if (!imageFile) throw new Error('Nenhuma imagem fornecida');
  
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    const response = await fetch(`${PYTHON_API_URL}/detect`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na deteção:', error);
    throw error;
  }
};

// Mock para quando o Python estiver offline (útil para demonstração)
export const mockDetectPestFromImage = async () => {
  return {
    success: true,
    detections: [
      { class: 'locust', confidence: 0.92, class_pt: 'Gafanhoto' },
      { class: 'bird', confidence: 0.78, class_pt: 'Pássaro' }
    ],
    total_count: 2,
    processing_time_ms: 1250,
    impact: {
      total_loss_kz: 250000,
      nivel_risco: 'MÉDIO'
    }
  };
};