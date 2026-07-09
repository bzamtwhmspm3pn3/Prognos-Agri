# backend/r/api/plumber.R
library(plumber)
library(jsonlite)

#* @apiTitle AgroOkuvanja R API
#* @apiDescription Análise estatística

#* Health check
#* @get /api/r/health
function() {
  list(
    status = "healthy",
    timestamp = Sys.time()
  )
}

#* Classificação de risco com Random Forest
#* @post /api/r/rf/classify
function(req) {
  data <- fromJSON(req$postBody)
  
  # Simulação de análise
  risk_score <- min(100, max(0, 50 + data$pest_count * 5))
  
  if (risk_score >= 75) {
    level <- "CRÍTICO"
  } else if (risk_score >= 50) {
    level <- "ALTO"
  } else if (risk_score >= 25) {
    level <- "MÉDIO"
  } else {
    level <- "BAIXO"
  }
  
  list(
    level = level,
    probability = risk_score / 100,
    recommendations = list(
      "Monitorar áreas afetadas",
      "Aplicar medidas de controlo"
    )
  )
}

#* Previsão GLM
#* @post /api/r/glm/predict
function(req) {
  data <- fromJSON(req$postBody)
  
  list(
    prediction = data$pest_count * 15000,
    confidence = c(0.85, 0.95)
  )
}