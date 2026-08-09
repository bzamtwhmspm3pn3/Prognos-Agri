// scripts/seed-demo.js
// Cria (ou actualiza) uma conta de acesso rápido de demonstração.
// Uso: node scripts/seed-demo.js
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const User = require('../models/user');
const { hashPassword } = require('../utils/helpers');

const DEMO = {
  username: 'demo',
  email: 'demo@prognosagri.com',
  password: 'demo1234',
  role: 'agricultor'
};

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI não definido no .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('🔥 MongoDB conectado');

  const hashed = await hashPassword(DEMO.password);
  const user = await User.findOneAndUpdate(
    { email: DEMO.email },
    {
      $set: {
        username: DEMO.username,
        password: hashed,
        role: DEMO.role,
        emailConfirmado: true,
        profile: {
          nome: 'Conta de Demonstração',
          telefone: '+244900000000',
          propriedade: 'Fazenda Demo',
          hectares: 10,
          culturas: ['Milho', 'Mandioca', 'Feijão'],
          localizacao: { provincia: 'Huambo', municipio: 'Caála', bairro: 'Centro' }
        },
        plano: {
          tipo: 'premium',
          scansRestantes: 100,
          scansUsados: 0,
          ativo: true
        }
      },
      $setOnInsert: { agrookuvanjaId: null }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('✅ Conta demo pronta:');
  console.log(`   Email: ${DEMO.email}`);
  console.log(`   Password: ${DEMO.password}`);
  console.log(`   Role: ${DEMO.role}`);
  console.log(`   _id: ${user._id}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
