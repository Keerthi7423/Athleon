FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 4003

ENV PORT=4003
ENV NODE_ENV=production

CMD ["npm", "start"]
