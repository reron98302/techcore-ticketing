FROM node:22

WORKDIR /app

# Copy frontend from repo root into the working directory
COPY frontend/ ./frontend/

# Copy backend source
COPY backend/ ./

# Install dependencies
RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
