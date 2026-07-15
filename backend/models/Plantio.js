const mongoose = require('mongoose');

const faseSchema = new mongoose.Schema({
  codigo: { type: String, required: true },
  nome: { type: String, required: true },
  ordem: { type: Number, required: true },
  status: { type: String, enum: ['pendente', 'em_andamento', 'concluido', 'pulado'], default: 'pendente' },
  dataInicio: Date,
  dataFim: Date,
  observacoes: String,
  recomendacaoIA: String,
  concluido: { type: Boolean, default: false }
});

const investimentoSchema = new mongoose.Schema({
  sementes: Number,
  fertilizantes: Number,
  defensivos: Number,
  maoObra: Number,
  maquinario: Number,
  imprevistos: Number,
  total: Number
}, { _id: false });

const capitalHumanoSchema = new mongoose.Schema({
  trabalhadoresPermanentes: Number,
  trabalhadoresSazonais: Number,
  tecnicosOperadores: Number,
  total: Number
}, { _id: false });

const cronogramaItemSchema = new mongoose.Schema({
  atividade: String,
  inicio: Date,
  fim: Date,
  dias: Number
}, { _id: false });

const producaoSchema = new mongoose.Schema({
  produtividadeTonHa: Number,
  areaTotalHa: Number,
  ProducaoTotalTon: Number,
  precoEstimado: Number,
  rendaBrutaEstimada: Number,
  lucroEstimado: Number
}, { _id: false });

const riscoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['climatico', 'praga', 'doenca'] },
  descricao: String,
  mitigacao: String
}, { _id: false });

const plantioSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nome: { type: String, required: true },
  cultura: { type: String, required: true },
  provincia: String,
  municipio: String,
  area: Number,
  orcamento: Number,
  dataInicio: Date,
  dataFimPrevista: Date,
  faseAtual: { type: Number, default: 0 },
  status: { type: String, enum: ['planeado', 'ativo', 'em_andamento', 'concluido', 'arquivado', 'cancelado'], default: 'planeado' },
  progresso: { type: Number, default: 0 },
  concluido: { type: Boolean, default: false },
  dataColheita: Date,
  producaoEstimada: Number,
  producaoReal: Number,
  receitaEstimada: Number,
  receitaReal: Number,
  fases: [faseSchema],
  plano: {
    resumo: String,
    recomendacaoLocalizacao: String,
    municipiosRecomendados: [{ nome: String, justificativa: String }],
    investimento: investimentoSchema,
    capitalHumano: capitalHumanoSchema,
    cronograma: [cronogramaItemSchema],
    producao: producaoSchema,
    riscos: [riscoSchema]
  }
}, { timestamps: true });

module.exports = mongoose.model('Plantio', plantioSchema);
