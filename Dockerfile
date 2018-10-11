FROM node:10

WORKDIR /app

COPY package.json yarn.lock ./

RUN npm install yarn@latest -g && yarn install --prod

COPY . .

CMD [ "yarn", "start" ]