FROM node:12 AS builder

WORKDIR /usr/src/app

COPY . .
RUN npm install && npm run build

FROM node:12

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

ENV GOOGLE_APPLICATION_CREDENTIALS="/usr/src/app/gcloud.json"

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]