# backend/Dockerfile
FROM node:18-slim

# Instalar Python e pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Copiar dependências Node
COPY package*.json ./
RUN npm ci --only=production

# Copiar dependências Python
COPY python/requirements.txt ./python/
RUN pip3 install --no-cache-dir -r python/requirements.txt

# Copiar o restante do código
COPY . .

EXPOSE 10000

CMD ["node", "server.js"]