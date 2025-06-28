# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy only dep first
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["pm2-runtime", "start", "npm", "--", "start", "--max-old-space-size=256"]
