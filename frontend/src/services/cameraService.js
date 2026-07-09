const STORAGE_KEY = 'agrookuvanja_cameras';

export function getCameras() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function getActiveCameras() {
  return getCameras().filter(c => c.ativa);
}

export function getCameraById(id) {
  return getCameras().find(c => c.id === id) || null;
}

export function saveCameras(cameras) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cameras));
}
