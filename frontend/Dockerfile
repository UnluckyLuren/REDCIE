FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construye el proyecto y mantiene el contenedor en ejecución
CMD ["sh", "-c", "npm run build && tail -f /dev/null"]
