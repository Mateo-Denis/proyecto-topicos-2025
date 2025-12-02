FROM node:20.19.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src

EXPOSE 3001

CMD ["npm", "start"]
