# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Install build dependencies for native modules (e.g., bcrypt)
RUN apk add --no-cache python3 make g++ 

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

# --- Stage 2: Production Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only production dependencies from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 4001

ENV PORT=4001
ENV NODE_ENV=production

CMD ["npm", "start"]
