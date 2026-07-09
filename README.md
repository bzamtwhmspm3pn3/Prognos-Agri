# 🌾 Prognos Agri 2.0

**Sistema Inteligente de Previsão e Gestão Agrícola**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Sobre o Projecto

Prognos Agri é uma plataforma completa para previsão climática, detecção de pragas, mercado agrícola em tempo real e rastreabilidade de produção. Desenvolvida por angolanos, para o mundo.

## Funcionalidades

- 🔮 **Previsão Climática Avançada** — Previsão do tempo para 7 dias com alertas de condições extremas
- 🔍 **Detecção de Pragas** via YOLOv8 com inteligência artificial
- 📊 **Mercado em Tempo Real** — Produtos agrícolas com preços actualizados
- 🤖 **Assistente Virtual com IA** — Chatbot inteligente para dúvidas agrícolas
- 🔗 **Rastreabilidade Blockchain** — Certificação digital com código QR
- 👥 **Comunidade e Fórum** — Partilha de experiências entre agricultores
- 🗺️ **Mapa de Risco** interactivo
- 📈 **Métricas de Produção** e relatórios

## Tecnologias

### Frontend
- React 18
- Framer Motion
- Chart.js / Recharts
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- FastAPI (Python)
- Ultralytics YOLOv8
- OpenCV

## Instalação

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- MongoDB Atlas

### Backend (Node.js)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Backend Python
```bash
cd backend/python
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd api
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Migração do AgroOkuvanja
```bash
cd backend
npm run migrate
```

## Deploy

### Frontend (Netlify)
```bash
cd frontend
npm run build
```

### Backend Node (Render)
Porta: 5000
Comando: npm start

### Backend Python (Render)
Porta: 8001
Comando: python api/app.py

### Banco de Dados (MongoDB Atlas)
Cluster gratuito já configurado

## Autor

**Venâncio Martins** — Criador do Prognos Agri

© 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴

## Licença

MIT
