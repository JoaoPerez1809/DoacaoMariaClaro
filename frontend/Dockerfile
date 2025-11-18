# Estágio 1: Instalação de Dependências e Build
# Usamos uma imagem Node.js leve baseada em Alpine Linux
FROM node:18-alpine AS builder
WORKDIR /app

# Copia os ficheiros de dependência
COPY package*.json ./

# Instala as dependências de produção
RUN npm install

# Copia o resto do código-fonte
COPY . .

# Executa o script de build do Next.js, que otimiza a aplicação para produção
RUN npm run build

# Estágio 2: Imagem Final de Execução
FROM node:18-alpine AS runner
WORKDIR /app

# Copia os ficheiros de dependência e o build do estágio anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expõe a porta que o Next.js usa por defeito
EXPOSE 3000

# Comando para iniciar o servidor Next.js em modo de produção
CMD ["npm", "start"]
