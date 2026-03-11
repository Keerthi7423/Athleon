FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 4002

ENV PORT=4002
ENV NODE_ENV=production

CMD ["npm", "start"]
