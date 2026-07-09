# backend/python/detection/pest_detector.py
from ultralytics import YOLO
import cv2
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

class PestDetector:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = "yolov8n.pt"
        
        try:
            self.model = YOLO(model_path)
            logger.info(f"✅ Modelo carregado: {model_path}")
        except Exception as e:
            logger.error(f"❌ Erro ao carregar modelo: {e}")
            self.model = None
        
        # Classes específicas para pragas agrícolas
        self.allowed_classes = {
            14: "bird",      # Pássaro
            15: "rat",       # Ratazana
            16: "mouse",     # Camundongo
        }
        
        # Mapeamento para português
        self.portuguese_names = {
            "bird": "Pássaro",
            "rat": "Ratazana",
            "mouse": "Camundongo"
        }
        
        # Valores de impacto (ajusta conforme a realidade angolana)
        self.impact_matrix = {
            "bird": 15000,
            "rat": 35000,
            "mouse": 8000,
        }
        
        # Configurações de deteção
        self.conf_threshold = 0.6  # Aumentado de 0.5 para 0.6 (mais rigor)
        self.iou_threshold = 0.45   # Overlap mínimo entre deteções

    def detect(self, image, conf_threshold=0.6):
        """
        Detecta pragas na imagem com maior rigor
        """
        if self.model is None:
            return []
        
        try:
            # Executar inferência com parâmetros otimizados
            results = self.model(
                image, 
                imgsz=640, 
                conf=conf_threshold,
                iou=self.iou_threshold,
                verbose=False,
                max_det=10  # Máximo de 10 deteções por imagem
            )
            
            detections = []
            for r in results:
                if r.boxes is None:
                    continue
                    
                for box in r.boxes:
                    cls = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    # Filtrar apenas classes de pragas com confiança mínima
                    if cls in self.allowed_classes and confidence >= conf_threshold:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        class_name = self.allowed_classes[cls]
                        
                        # Calcular área do bounding box
                        area = (x2 - x1) * (y2 - y1)
                        
                        # Filtrar deteções muito pequenas (ruído)
                        if area < 1000:  # Ignorar deteções muito pequenas
                            continue
                        
                        detections.append({
                            "class": class_name,
                            "class_pt": self.portuguese_names.get(class_name, class_name),
                            "confidence": round(confidence, 3),
                            "bbox": [int(x1), int(y1), int(x2), int(y2)],
                            "area": int(area)
                        })
            
            # Log para debug
            if detections:
                logger.info(f"✅ Detectadas {len(detections)} pragas")
                for det in detections:
                    logger.info(f"   - {det['class_pt']}: {det['confidence']:.2f} (área: {det['area']}px)")
            else:
                logger.info("✅ Nenhuma praga detectada")
            
            return detections
            
        except Exception as e:
            logger.error(f"❌ Erro na deteção: {e}")
            return []

    def detect_stream(self, image, conf_threshold=0.5):
        """
        Versão otimizada para streaming (mais rápida)
        """
        if self.model is None:
            return image, [], False
        
        try:
            # Reduzir resolução para streaming (mais rápido)
            small_image = cv2.resize(image, (320, 320))
            
            results = self.model(
                small_image, 
                imgsz=320, 
                conf=conf_threshold,
                verbose=False,
                max_det=5
            )
            
            detections = []
            pest_detected = False
            
            for r in results:
                if r.boxes is None:
                    continue
                    
                for box in r.boxes:
                    cls = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    if cls in self.allowed_classes:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        # Escalar de volta para o tamanho original
                        scale_x = image.shape[1] / 320
                        scale_y = image.shape[0] / 320
                        
                        x1 = int(x1 * scale_x)
                        y1 = int(y1 * scale_y)
                        x2 = int(x2 * scale_x)
                        y2 = int(y2 * scale_y)
                        
                        class_name = self.allowed_classes[cls]
                        detections.append({
                            "class": class_name,
                            "class_pt": self.portuguese_names.get(class_name, class_name),
                            "confidence": round(confidence, 3)
                        })
                        pest_detected = True
                        
                        # Desenhar bounding box na imagem
                        color = (0, 255, 0) if class_name == "bird" else (0, 0, 255)
                        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
                        label = f"{self.portuguese_names.get(class_name, class_name)}: {confidence:.2f}"
                        cv2.putText(image, label, (x1, y1-10), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            return image, detections, pest_detected
            
        except Exception as e:
            logger.error(f"Erro no stream: {e}")
            return image, [], False

    def calculate_impact(self, detections):
        """
        Calcula impacto económico baseado nas deteções
        """
        if not detections:
            return {
                "total_loss_kz": 0,
                "total_loss_usd": 0,
                "nivel_risco": "NENHUM",
                "breakdown": {}
            }
        
        total_loss = 0
        breakdown = {}
        
        for det in detections:
            class_name = det["class"]
            loss = self.impact_matrix.get(class_name, 0)
            
            # Ajustar perda baseada na confiança
            confidence = det.get("confidence", 0.5)
            adjusted_loss = loss * confidence
            
            total_loss += adjusted_loss
            
            if class_name not in breakdown:
                breakdown[class_name] = {
                    "count": 0,
                    "loss": 0,
                    "class_pt": self.portuguese_names.get(class_name, class_name)
                }
            breakdown[class_name]["count"] += 1
            breakdown[class_name]["loss"] += adjusted_loss
        
        return {
            "total_loss_kz": round(total_loss, 2),
            "total_loss_usd": round(total_loss / 920, 2),
            "nivel_risco": self._get_risk_level(total_loss),
            "breakdown": breakdown
        }

    def _get_risk_level(self, loss):
        if loss > 100000:
            return "CRÍTICO"
        if loss > 50000:
            return "ALTO"
        if loss > 20000:
            return "MÉDIO"
        if loss > 0:
            return "BAIXO"
        return "NENHUM"

    def is_loaded(self):
        return self.model is not None

    def get_model_info(self):
        return {
            "loaded": self.is_loaded(),
            "classes": list(self.allowed_classes.values()),
            "portuguese_names": self.portuguese_names,
            "config": {
                "conf_threshold": self.conf_threshold,
                "iou_threshold": self.iou_threshold
            }
        }