FROM node:20-slim

WORKDIR /app

# Install build tools needed for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
