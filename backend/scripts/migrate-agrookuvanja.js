require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function migrate() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  🌾 PROGNOS AGRI — Migração AgroOkuvanja    ║');
  console.log('║  © 2026 Venâncio Martins                     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  const oldUri = process.env.AGROOKUVANJA_MONGO_URI || process.env.OLD_MONGO_URI;
  if (!oldUri) {
    console.log('❌ Variável AGROOKUVANJA_MONGO_URI ou OLD_MONGO_URI não definida no .env');
    console.log('   Adicione ao .env:');
    console.log('   AGROOKUVANJA_MONGO_URI=mongodb+srv://...');
    process.exit(1);
  }

  console.log('📦 A conectar à base de dados AgroOkuvanja...');
  const oldConn = await mongoose.createConnection(oldUri).asPromise();

  console.log('📦 A conectar à base de dados Prognos Agri...');
  const newUri = process.env.MONGO_URI;
  const newConn = await mongoose.createConnection(newUri).asPromise();

  const estatisticas = {
    usuarios: 0,
    deteccoes: 0,
    profiles: 0,
    erros: 0
  };

  console.log('\n🚀 Iniciando migração...\n');

  try {
    // 1. Migrar Users
    console.log('📋 Migrando utilizadores...');
    const oldUsers = oldConn.collection('users');
    const newUsers = newConn.collection('users');
    const users = await oldUsers.find({}).toArray();

    for (const user of users) {
      try {
        const existing = await newUsers.findOne({ email: user.email });
        if (!existing) {
          await newUsers.insertOne({
            ...user,
            platform: 'prognos-agri',
            agrookuvanjaId: user._id,
            _id: user._id,
            updatedAt: new Date()
          });
          estatisticas.usuarios++;
        }
      } catch (err) {
        estatisticas.erros++;
        console.error(`   ⚠️ Erro ao migrar user ${user.email}: ${err.message}`);
      }
    }
    console.log(`   ✅ ${estatisticas.usuarios} utilizadores migrados`);

    // 2. Migrar Detecções
    console.log('\n📋 Migrando detecções...');
    const oldDetections = oldConn.collection('deteccaos');
    const newDetections = newConn.collection('deteccaos');
    const detections = await oldDetections.find({}).toArray();

    for (const det of detections) {
      try {
        const existing = await newDetections.findOne({ _id: det._id });
        if (!existing) {
          await newDetections.insertOne({
            ...det,
            platform: 'prognos-agri',
            agrookuvanjaId: det._id,
            updatedAt: new Date()
          });
          estatisticas.deteccoes++;
        }
      } catch (err) {
        estatisticas.erros++;
        console.error(`   ⚠️ Erro ao migrar detecção ${det._id}: ${err.message}`);
      }
    }
    console.log(`   ✅ ${estatisticas.deteccoes} detecções migradas`);

    // 3. Migrar Profiles
    console.log('\n📋 Migrando perfis...');
    const oldProfiles = oldConn.collection('profiles');
    const newProfiles = newConn.collection('profiles');
    const profiles = await oldProfiles.find({}).toArray();

    for (const profile of profiles) {
      try {
        const existing = await newProfiles.findOne({ _id: profile._id });
        if (!existing) {
          await newProfiles.insertOne({
            ...profile,
            platform: 'prognos-agri',
            updatedAt: new Date()
          });
          estatisticas.profiles++;
        }
      } catch (err) {
        estatisticas.erros++;
        console.error(`   ⚠️ Erro ao migrar profile ${profile._id}: ${err.message}`);
      }
    }
    console.log(`   ✅ ${estatisticas.profiles} perfis migrados`);

    // 4. Migrar coleções do DetectionModel
    console.log('\n📋 Migrando DetectionModel...');
    const oldDetectionsModel = oldConn.collection('detections');
    const newDetectionsModel = newConn.collection('detections');
    const detectionsModel = await oldDetectionsModel.find({}).toArray();

    for (const det of detectionsModel) {
      try {
        const existing = await newDetectionsModel.findOne({ _id: det._id });
        if (!existing) {
          await newDetectionsModel.insertOne({
            ...det,
            platform: 'prognos-agri',
            agrookuvanjaId: det._id,
            updatedAt: new Date()
          });
          estatisticas.deteccoes++;
        }
      } catch (err) {
        estatisticas.erros++;
        console.error(`   ⚠️ Erro ao migrar detection ${det._id}: ${err.message}`);
      }
    }
    console.log(`   ✅ ${detectionsModel.length} DetectionModel migrados`);

  } catch (error) {
    console.error('\n❌ Erro durante migração:', error);
  } finally {
    await oldConn.close();
    await newConn.close();
  }

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║         📊 RESUMO DA MIGRAÇÃO               ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Utilizadores:         ${String(estatisticas.usuarios).padStart(5)}        ║`);
  console.log(`║  Detecções:            ${String(estatisticas.deteccoes).padStart(5)}        ║`);
  console.log(`║  Perfis:               ${String(estatisticas.profiles).padStart(5)}        ║`);
  console.log(`║  Erros:                ${String(estatisticas.erros).padStart(5)}        ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  ✅ Migração concluída com sucesso!          ║');
  console.log('║  © 2026 Venâncio Martins                     ║');
  console.log('╚══════════════════════════════════════════════╝');

  rl.close();
  process.exit(0);
}

rl.question('\n⚠️  Este script irá migrar dados do AgroOkuvanja para o Prognos Agri.\n   Continuar? (s/N): ', (answer) => {
  if (answer.toLowerCase() === 's') {
    migrate();
  } else {
    console.log('Migração cancelada.');
    process.exit(0);
  }
});
