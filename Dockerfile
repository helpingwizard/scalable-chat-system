FROM node:20
WORKDIR /opt/chat-system
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
CMD ["node", "dist/index.js"]
