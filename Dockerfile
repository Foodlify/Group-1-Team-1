FROM node:25.9.0-alpine

WORKDIR /usr/src/app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package configurations
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose API port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
