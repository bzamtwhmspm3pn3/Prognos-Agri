@echo off
title AgroOkuvanja - Instalação Completa
color 0A

echo ========================================
echo    🌱 AGROOKUVANJA - INSTALAÇÃO
echo ========================================
echo.

:: 1. Instalar dependências Node.js
echo 📦 Instalando dependências Node.js...
call npm install axios form-data multer
if %errorlevel% neq 0 (
  echo ❌ Erro ao instalar Node.js
  pause
  exit /b
)
echo ✅ Node.js OK
echo.

:: 2. Instalar dependências Python
echo 🐍 Instalando dependências Python...
cd python

:: Criar requirements.txt se não existir
if not exist requirements.txt (
  echo fastapi==0.104.1 > requirements.txt
  echo uvicorn==0.24.0 >> requirements.txt
  echo ultralytics==8.0.196 >> requirements.txt
  echo opencv-python==4.8.1.78 >> requirements.txt
  echo numpy==1.24.3 >> requirements.txt
  echo python-multipart==0.0.6 >> requirements.txt
)

:: Instalar pacotes
pip install -r requirements.txt
if %errorlevel% neq 0 (
  echo ⚠️ Erro ao instalar pacotes Python
) else (
  echo ✅ Python OK
)
cd ..
echo.

:: 3. Instalar dependências R
echo 🇷 Instalando dependências R...
cd r

:: Criar script R se não existir
if not exist install_packages.R (
  echo packages ^< - c^("plumber", "jsonlite", "glmnet", "randomForest"^) > install_packages.R
  echo for (pkg in packages^) { >> install_packages.R
  echo   if ^(!require(pkg, character.only = TRUE^)^) { >> install_packages.R
  echo     install.packages(pkg, dependencies = TRUE^) >> install_packages.R
  echo   } >> install_packages.R
  echo } >> install_packages.R
)

Rscript install_packages.R
if %errorlevel% neq 0 (
  echo ⚠️ Erro ao instalar pacotes R
) else (
  echo ✅ R OK
)
cd ..
echo.

:: 4. Baixar modelo YOLO
echo 🤖 Baixando modelo YOLO...
cd python
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')" 2>nul
if exist detection\yolov8n.pt (
  echo ✅ Modelo YOLO OK
) else (
  echo ⚠️ Modelo YOLO pode não ter sido baixado
)
cd ..
echo.

echo ========================================
echo    🎯 INSTALAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo Para iniciar os serviços:
echo   1. start-services.bat
echo.
pause