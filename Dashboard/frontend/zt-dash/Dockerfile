FROM node:24-alpine
WORKDIR /zt-dash
COPY package*.json .
RUN npm install 
COPY . .
ENV VITE_LOKI_URL=http://loki:3100
EXPOSE 5173
CMD ["npm", "run", "dev"]