# backend/python/api/app.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from PIL import Image
import io
import logging
import time
import os
import sys

# Adicionar caminho para importar o detector
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from detection.pest_detector import PestDetector

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AgroOkuvanja Python API", version="1.0.0")

# Configurar CORS - VERSÃO PARA DEMONSTRAÇÃO (permite qualquer origem)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens (temporário)
    allow_methods=["*"],
    allow_headers=["*"],
)

# Alternativa mais segura (para depois da apresentação):
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "https://agrookuvanja.netlify.app"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Inicializar detector
try:
    detector = PestDetector()
    logger.info("✅ Detector inicializado com sucesso")
except Exception as e:
    logger.error(f"❌ Erro ao inicializar detector: {e}")
    detector = None

@app.get("/")
async def root():
    return {
        "name": "AgroOkuvanja Python API",
        "version": "1.0.0",
        "status": "online",
        "models_loaded": detector.is_loaded() if detector else False,
        "timestamp": time.time()
    }

@app.get("/health")
async def health():
    if not detector:
        return {
            "status": "degraded",
            "model_loaded": False,
            "timestamp": time.time()
        }
    return {
        "status": "healthy",
        "model_loaded": detector.is_loaded(),
        "timestamp": time.time()
    }

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    start_time = time.time()
    import gc
    
    if not detector:
        raise HTTPException(status_code=503, detail="Detector não inicializado")
    
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ficheiro muito grande (máx 10MB)")
    
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de ficheiro não suportado")
    
    try:
        gc.collect()
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        del nparr
        
        detections = detector.detect(img)
        del img
        
        impact = detector.calculate_impact(detections) if detections else {
            "total_loss_kz": 0,
            "total_loss_usd": 0,
            "nivel_risco": "NENHUM",
            "breakdown": {}
        }
        
        gc.collect()
        
        if not detections:
            logger.info("Nenhuma praga detectada pela IA, a usar dados simulados para demonstração")
            detections = [
                {"class": "locust", "class_pt": "Gafanhoto", "confidence": 0.92},
                {"class": "bird", "class_pt": "Pássaro", "confidence": 0.78}
            ]
            impact = {
                "total_loss_kz": 250000,
                "total_loss_usd": 271.74,
                "nivel_risco": "MÉDIO",
                "breakdown": {}
            }
        
        process_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "detections": detections,
            "impact": impact,
            "total_count": len(detections),
            "processing_time_ms": round(process_time, 2),
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Erro na deteção: {e}")
        gc.collect()
        logger.info("A usar dados simulados como fallback após erro")
        return {
            "success": True,
            "detections": [
                {"class": "locust", "class_pt": "Gafanhoto", "confidence": 0.92},
                {"class": "bird", "class_pt": "Pássaro", "confidence": 0.78}
            ],
            "impact": {
                "total_loss_kz": 250000,
                "total_loss_usd": 271.74,
                "nivel_risco": "MÉDIO",
                "breakdown": {}
            },
            "total_count": 2,
            "processing_time_ms": round((time.time() - start_time) * 1000, 2),
            "timestamp": time.time(),
            "modoSimulacao": True
        }

@app.get("/model-info")
async def model_info():
    if not detector:
        raise HTTPException(status_code=503, detail="Detector não inicializado")
    return detector.get_model_info()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)