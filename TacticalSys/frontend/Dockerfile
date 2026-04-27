# syntax=docker/dockerfile:1

FROM node:25-alpine
WORKDIR /app
COPY . .
RUN npm install --omit=dev
CMD ["npm", "run", "dev"]
EXPOSE 3000