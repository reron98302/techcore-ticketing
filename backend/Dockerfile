FROM node:22

WORKDIR /app

# Copy frontend from repo root — must come after backend files
# to avoid being overwritten by a broad backend/ copy
COPY backend/package.json backend/package-lock.json ./
COPY backend/server.js backend/seed.js ./
COPY backend/config/ ./config/
COPY backend/middleware/ ./middleware/
COPY backend/routes/ ./routes/

# Copy frontend into its own subdirectory (server.js expects ./frontend)
COPY frontend/ ./frontend/

# Install dependencies
RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
