# Use Node.js 20-alpine as the base image for a small footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies first
# This leverages Docker's cache for faster builds
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose the service port
EXPOSE 8080

# Define environment variables with defaults
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
