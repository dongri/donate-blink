FROM node:20-alpine

WORKDIR /app/src

ADD package.json /app/package.json

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
