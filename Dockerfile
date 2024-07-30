FROM node:20
WORKDIR /opt/chat-system
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
