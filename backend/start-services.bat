@echo off
title AgroOkuvanja Services
color 0A

echo ========================================
echo 🚀 Iniciando Serviços AgroOkuvanja
echo ========================================

:: Iniciar Python
echo.
echo 📡 Iniciando Python API (porta 8001)...
cd python
start /B python -m uvicorn api.app:app --host 0.0.0.0 --port 8001 --reload
cd ..

:: Aguardar Python iniciar
timeout /t 3 /nobreak > nul

:: Iniciar R
echo 📊 Iniciando R API (porta 8002)...
cd r
start /B Rscript -e "library(plumber); pr <- plumb('api/plumber.R'); pr$run(host='0.0.0.0', port=8002)"
cd ..

:: Aguardar R iniciar
timeout /t 3 /nobreak > nul

:: Iniciar Node
echo 🌱 Iniciando Node.js API (porta 5000)...
start /B npm run dev

echo.
echo ========================================
echo 🎯 Todos os serviços iniciados!
echo ========================================
echo 📌 Python API: http://localhost:8001/docs
echo 📌 R API:      http://localhost:8002/__docs__
echo 📌 Node API:   http://localhost:5000
echo ========================================
echo.
pause