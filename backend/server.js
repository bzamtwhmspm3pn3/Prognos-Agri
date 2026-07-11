require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require('path');

const authRoutes = require("./routes/auth");
const avaliacaoRoutes = require("./routes/avaliacoes");
const chatbotRoutes = require("./routes/chatbot");
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require("./routes/dashboard");
const modelosRoutes = require('./routes/modelos');
const detectionRoutes = require("./routes/detectionRoutes");
const deteccoesRoutes = require('./routes/deteccoes');
const predictRoutes = require('./routes/predict');
const marketRoutes = require('./routes/market');
const communityRoutes = require('./routes/community');
const rastreabilidadeRoutes = require('./routes/rastreabilidade');

const mercadoYangueProxy = require('./routes/mercadoYangueProxy');
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

const defaultOrigins = [
  'http://localhost:3000',
  'https://prognosagri.vercel.app',
  'https://prognos-agri-frontend.onrender.com',
  'https://prognos-agri.onrender.com'
];
const envOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origem: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type', 'Content-Disposition'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Cache-Control'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'credentialless');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Content-Disposition');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Muitas requisições deste IP, tente novamente mais tarde."
  }
});
app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y',
  immutable: true
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB conectado com sucesso"))
  .catch((err) => {
    console.error("❌ ERRO A CONECTAR MONGO:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/avaliacoes", avaliacaoRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/modelos', modelosRoutes);
app.use("/api/detection", detectionRoutes);
app.use('/api/deteccoes', deteccoesRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/rastreabilidade', rastreabilidadeRoutes);
app.use('/api/mercado-yangue', mercadoYangueProxy);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🌾 Prognos Agri 2.0 Backend operacional",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    platform: "prognos-agri",
    author: "Venâncio Martins"
  });
});

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>🌾 Prognos Agri 2.0 — Backend</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            padding: 40px;
            background: linear-gradient(135deg, #003366 0%, #0055A5 50%, #4A7C59 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { max-width: 800px; width: 100%; }
          .logo-icon {
            width: 80px; height: 80px;
            background: rgba(255,255,255,0.15);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            margin-bottom: 20px;
            border: 2px solid rgba(255,255,255,0.2);
          }
          h1 { font-family: 'Montserrat', sans-serif; font-size: 2.8rem; margin-bottom: 8px; }
          .subtitle { color: rgba(255,255,255,0.8); font-size: 1.1rem; margin-bottom: 30px; }
          .card {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 20px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.15);
          }
          .badge {
            background: #F5A623;
            color: #003366;
            padding: 4px 14px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-block;
            margin: 4px;
          }
          .badge.green { background: #4A7C59; color: white; }
          .badge.blue { background: #003366; color: white; }
          a { color: #F5A623; text-decoration: none; }
          a:hover { text-decoration: underline; }
          ul { list-style: none; padding: 0; }
          ul li { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .footer { margin-top: 30px; text-align: center; color: rgba(255,255,255,0.6); font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-icon">🌾</div>
          <h1>Prognos Agri</h1>
          <p class="subtitle">Sistema Inteligente de Previsão e Gestão Agrícola — Backend</p>
          <div class="card">
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
              <span class="badge">🚀 v2.0.0</span>
              <span class="badge green">📊 API Online</span>
              <span class="badge blue">🔥 MongoDB</span>
              <span class="badge">🔗 Blockchain</span>
            </div>
            <p><strong>📍 Porta:</strong> ${PORT}</p>
            <p><strong>🌍 Ambiente:</strong> ${process.env.NODE_ENV || "development"}</p>
            <p><strong>🔗 Frontend:</strong> ${process.env.FRONTEND_URL || "http://localhost:3000"}</p>
          </div>
          <div class="card">
            <h2 style="font-family: 'Montserrat', sans-serif; margin-bottom: 15px;">📋 Endpoints</h2>
            <ul>
              <li>• <a href="/api/health">/api/health</a> — Status</li>
              <li>• /api/auth — Autenticação</li>
              <li>• /api/dashboard — Dashboard</li>
              <li>• /api/predict — Previsões Climáticas</li>
              <li>• /api/market — Mercado Agrícola</li>
              <li>• /api/chatbot — Assistente Virtual</li>
              <li>• /api/community — Comunidade</li>
              <li>• /api/rastreabilidade — Blockchain</li>
              <li>• /api/detection — Detecção de Pragas (YOLO)</li>
            </ul>
          </div>
          <div class="footer">
            © 2026 Venâncio Martins — Criado por angolanos, para o mundo 🇦🇴
          </div>
        </div>
      </body>
    </html>
  `);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🌾 PROGNOS AGRI 2.0 BACKEND INICIADO");
  console.log("=".repeat(60));
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
  console.log(`🔥 MongoDB: Conectado`);
  console.log(`📦 Platform: prognos-agri`);
  console.log(`👤 Autor: Venâncio Martins`);
  console.log("=".repeat(60));
});

module.exports = app;
