FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./

RUN npm install yarn@latest -g && yarn install --prod && \
  apt-get update && apt-get -y install wget && \
  wget -O /bin/docker https://master.dockerproject.org/linux/x86_64/docker && \
  chmod +x /bin/docker

COPY . .

CMD [ "yarn", "start" ]