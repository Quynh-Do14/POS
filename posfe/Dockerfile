FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
RUN mkdir -p  /run
COPY --from=build /app/dist /run
COPY nginx.conf /etc/nginx/nginx.conf
