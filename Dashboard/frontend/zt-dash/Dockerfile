FROM node:24-alpine
WORKDIR /zt-dash
COPY package*.json .
RUN npm install 
COPY . .
CMD ["npm", "run", "dev"]
EXPOSE 5173