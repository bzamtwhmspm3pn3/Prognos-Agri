const { v4: uuidv4 } = require('uuid');

class BlockchainService {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
  }

  createBlock(transactions, previousHash = '') {
    const block = {
      index: this.chain.length + 1,
      timestamp: new Date().toISOString(),
      transactions,
      previousHash: previousHash || this.getLastBlockHash(),
      hash: this.generateHash(),
      nonce: Math.floor(Math.random() * 1000000)
    };
    this.chain.push(block);
    this.pendingTransactions = [];
    return block;
  }

  addTransaction(transaction) {
    this.pendingTransactions.push({
      ...transaction,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    });
    return this.pendingTransactions[this.pendingTransactions.length - 1];
  }

  generateHash() {
    const data = `${Date.now()}-${uuidv4()}`;
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += Math.floor(Math.random() * 16).toString(16);
    }
    return hash;
  }

  getLastBlockHash() {
    if (this.chain.length === 0) return '0x0000000000000000000000000000000000000000';
    return this.chain[this.chain.length - 1].hash;
  }

  verifyChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  async registerProductHash(productData) {
    const transaction = this.addTransaction({
      type: 'REGISTRY',
      data: productData,
      metadata: {
        platform: 'prognos-agri',
        version: '2.0.0'
      }
    });

    const block = this.createBlock([transaction]);
    return {
      blockHash: block.hash,
      transactionId: transaction.id,
      blockIndex: block.index,
      timestamp: block.timestamp
    };
  }

  async consultarProduto(hash) {
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.id === hash || block.hash === hash) {
          return {
            block,
            transaction,
            verified: true
          };
        }
      }
    }
    return null;
  }

  async getHealth() {
    return {
      status: 'operational',
      chainLength: this.chain.length,
      pendingTransactions: this.pendingTransactions.length,
      verified: this.verifyChain(),
      platform: 'prognos-agri',
      timestamp: new Date().toISOString()
    };
  }
}

const blockchainService = new BlockchainService();
module.exports = blockchainService;
