// src/services/vozService.js

class VozService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.vozApresentadora = null;
    this.idioma = 'pt-AO'; // Português de Angola
    this.carregarVozes();
  }

  carregarVozes() {
    const carregar = () => {
      this.voices = this.synthesis.getVoices();
      
      // Prioridade 1: voz especificamente de Angola (pt-AO)
      this.vozApresentadora = this.voices.find(v => v.lang === 'pt-AO' || v.lang.startsWith('pt-AO'));
      
      // Prioridade 2: voz feminina de Portugal (pt-PT)
      if (!this.vozApresentadora) {
        const vozesPT = ['helena', 'joana', 'maria', 'sara', 'ana', 'lucia', 'female', 'feminina'];
        this.vozApresentadora = this.voices.find(v => 
          (v.lang === 'pt-PT' || v.lang.startsWith('pt-PT')) && 
          vozesPT.some(nome => v.name.toLowerCase().includes(nome))
        );
      }
      
      // Prioridade 3: qualquer voz de Portugal
      if (!this.vozApresentadora) {
        this.vozApresentadora = this.voices.find(v => v.lang === 'pt-PT' || v.lang.startsWith('pt-PT'));
      }
      
      // Prioridade 4: voz feminina brasileira
      if (!this.vozApresentadora) {
        const vozesBR = ['helena', 'maria', 'joana', 'sara', 'lucia', 'female', 'feminina'];
        this.vozApresentadora = this.voices.find(v => 
          (v.lang === 'pt-BR' || v.lang.startsWith('pt-BR')) && 
          vozesBR.some(nome => v.name.toLowerCase().includes(nome))
        );
      }
      
      // Prioridade 5: qualquer voz portuguesa (inclui Brasil)
      if (!this.vozApresentadora) {
        this.vozApresentadora = this.voices.find(v => v.lang.includes('pt'));
      }
      
      const nomeVoz = this.vozApresentadora?.name || 'Padrão';
      const langVoz = this.vozApresentadora?.lang || '';
      console.log(`🎤 Voz carregada: ${nomeVoz} (${langVoz})`);
    };
    
    carregar();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = carregar;
    }
  }

  /**
   * Converte números para texto por extenso em português de Angola
   */
  numeroPorExtenso(numero) {
    if (!numero && numero !== 0) return '';
    
    const unidades = [
      '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
      'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis',
      'dezassete', 'dezoito', 'dezanove'
    ];
    
    const dezenas = [
      '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
      'sessenta', 'setenta', 'oitenta', 'noventa'
    ];
    
    const centenas = [
      '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
      'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
    ];
    
    // Números especiais
    if (numero === 100) return 'cem';
    if (numero === 1000) return 'mil';
    if (numero === 1000000) return 'um milhão';
    
    // Milhares
    if (numero >= 1000) {
      const milhares = Math.floor(numero / 1000);
      const resto = numero % 1000;
      
      let resultado = '';
      if (milhares === 1) {
        resultado = 'mil';
      } else {
        resultado = this.numeroPorExtenso(milhares) + ' mil';
      }
      
      if (resto > 0) {
        resultado += ' e ' + this.numeroPorExtenso(resto);
      }
      return resultado;
    }
    
    // Centenas
    if (numero >= 100) {
      const centena = Math.floor(numero / 100);
      const resto = numero % 100;
      
      let resultado = centenas[centena];
      if (resto > 0) {
        resultado += ' e ' + this.numeroPorExtenso(resto);
      }
      return resultado;
    }
    
    // Dezenas
    if (numero >= 20) {
      const dezena = Math.floor(numero / 10);
      const unidade = numero % 10;
      
      if (unidade === 0) {
        return dezenas[dezena];
      } else {
        return dezenas[dezena] + ' e ' + unidades[unidade];
      }
    }
    
    // Unidades e números até 19
    return unidades[numero] || numero.toString();
  }

  /**
   * Formata valor monetário em Kwanzas
   */
  formatarKwanzas(valor) {
    if (!valor) return '';
    
    // Separa milhares
    const valorInt = Math.round(valor);
    
    if (valorInt >= 1000000) {
      const milhoes = (valorInt / 1000000).toFixed(1);
      const [milhoesInt, milhoesDec] = milhoes.split('.');
      
      if (milhoesDec === '0') {
        return this.numeroPorExtenso(parseInt(milhoesInt)) + ' milhões de kwanzas';
      } else {
        return this.numeroPorExtenso(parseInt(milhoesInt)) + ' vírgula ' + 
               milhoesDec + ' milhões de kwanzas';
      }
    }
    
    if (valorInt >= 1000) {
      const milhares = Math.floor(valorInt / 1000);
      const resto = valorInt % 1000;
      
      let resultado = this.numeroPorExtenso(milhares) + ' mil';
      
      if (resto > 0) {
        if (resto < 100) {
          resultado += ' e ' + this.numeroPorExtenso(resto);
        } else {
          resultado += ' ' + this.numeroPorExtenso(resto);
        }
      }
      
      return resultado + ' kwanzas';
    }
    
    return this.numeroPorExtenso(valorInt) + ' kwanzas';
  }

  /**
   * Fala com entonação profissional de TV
   */
  falar(texto, opcoes = {}) {
    if (!texto) return;

    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    
    if (this.vozApresentadora) {
      utterance.voice = this.vozApresentadora;
    }
    
    // Configurações profissionais
    utterance.lang = 'pt-AO';
    utterance.rate = opcoes.rate || 0.92;      // Velocidade controlada
    utterance.pitch = opcoes.pitch || 1.05;     // Tom feminino natural
    utterance.volume = 1;

    // Entonação baseada no tipo de mensagem
    if (opcoes.tipo === 'alerta') {
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
    } else if (opcoes.tipo === 'urgente') {
      utterance.rate = 1.0;
      utterance.pitch = 1.15;
    } else if (opcoes.tipo === 'calmo') {
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
    }

    utterance.onstart = () => console.log('🎤 Apresentadora:', texto.substring(0, 40) + '...');
    utterance.onend = () => console.log('✅ Fala concluída');
    utterance.onerror = (e) => console.error('❌ Erro na fala:', e);

    this.synthesis.speak(utterance);
    return utterance;
  }

  /**
   * Fala resultado da deteção com números por extenso
   */
  falarResultadoPraga(dados) {
    let mensagem = '';
    
    if (!dados.detections || dados.detections.length === 0) {
      mensagem = 'Boas notícias! A vistoria não encontrou nenhuma praga na sua plantação. ' +
        'Pode ficar descansado, as suas culturas estão saudáveis. Continue com o excelente trabalho!';
      this.falar(mensagem, { tipo: 'calmo' });
      return;
    }
    
    const praga = dados.detections[0];
    const numPragas = dados.detections.length;
    
    // Abertura profissional
    mensagem = `Atenção, temos uma actualização importante sobre a sua plantação. `;
    
    // Detalhamento
    if (numPragas === 1) {
      mensagem += `O sistema detectou a presença de ${praga.class_pt || 'uma praga'}`;
    } else {
      mensagem += `Foram identificadas ${this.numeroPorExtenso(numPragas)} pragas diferentes. `;
      mensagem += `A principal é ${praga.class_pt || 'uma praga'}`;
    }
    
    if (dados.localizacao) {
      mensagem += `, na área ${dados.localizacao}`;
    }
    mensagem += `. `;
    
    // Impacto económico
    if (dados.impact?.total_loss_kz) {
      mensagem += `De acordo com a nossa análise, o impacto económico estimado é de `;
      mensagem += this.formatarKwanzas(dados.impact.total_loss_kz) + `. `;
      
      if (dados.impact.nivel_risco === 'CRÍTICO') {
        mensagem += `Esta é uma situação crítica que requer intervenção imediata. `;
      } else if (dados.impact.nivel_risco === 'ALTO') {
        mensagem += `O nível de risco é alto, recomendo atenção redobrada. `;
      }
    }
    
    // Recomendações
    if (dados.recomendacoes?.length > 0) {
      mensagem += `Como medida preventiva, recomendo que ${dados.recomendacoes[0].toLowerCase()}. `;
    }
    
    // Encerramento
    mensagem += `A equipa AgroOkuvanja continua a monitorizar a sua plantação. `;
    mensagem += `Estamos aqui para ajudar.`;
    
    this.falar(mensagem, { tipo: 'alerta' });
  }

  /**
   * Alerta de emergência
   */
  falarAlerta(titulo, mensagem, dados = {}) {
    let texto = `Atenção! ${titulo}. `;
    texto += mensagem;
    
    if (dados.localizacao) {
      texto += ` A área afectada é o ${dados.localizacao}.`;
    }
    
    if (dados.impacto) {
      texto += ` O prejuízo estimado é de ${this.formatarKwanzas(dados.impacto)}.`;
    }
    
    if (dados.severidade === 'alta' || dados.severidade === 'critica') {
      texto += ` Necessita de acção imediata.`;
    }
    
    texto += ` Vamos acompanhar a situação de perto.`;
    
    this.falar(texto, { tipo: 'urgente' });
  }

  /**
   * Recomendação técnica
   */
  falarRecomendacao(recomendacao, contexto = '') {
    let texto = `Com base na análise dos dados, `;
    
    if (contexto) {
      texto += contexto + ', ';
    }
    
    texto += `a nossa recomendação técnica é: ${recomendacao}. `;
    texto += `Esta medida está alinhada com as boas práticas agrícolas. `;
    texto += `Precisa de mais alguma informação?`;
    
    this.falar(texto, { tipo: 'calmo' });
  }

  /**
   * Boas-vindas calorosa
   */
  falarBoasVindas(nome) {
    const hora = new Date().getHours();
    let saudacao = '';
    
    if (hora < 12) saudacao = 'Bom dia';
    else if (hora < 18) saudacao = 'Boa tarde';
    else saudacao = 'Boa noite';
    
    const mensagem = `${saudacao}, ${nome || 'agricultor'}! Seja bem-vindo ao sistema AgroOkuvanja. ` +
      `Sou a sua assistente virtual especializada em detecção de pragas. ` +
      `Estarei aqui para monitorizar as suas culturas e avisar sobre qualquer ameaça. ` +
      `Pode contar comigo para proteger a sua produção. ` +
      `Vamos começar?`;
    
    this.falar(mensagem, { tipo: 'calmo' });
  }

  /**
   * Para a fala atual
   */
  parar() {
    this.synthesis.cancel();
  }
}

export default new VozService();