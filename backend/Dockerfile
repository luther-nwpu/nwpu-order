FROM node:9.8-alpine

RUN apk update
RUN apk add sox
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

COPY package.json /tmp/package.json

WORKDIR /tmp
RUN cd /tmp && \
    npm config set registry https://registry.npm.taobao.org && \
    npm install --production && \
    npm install pm2 -g && npm install typescript -g && \
    mkdir -p /opt/workdir && mv /tmp/node_modules /opt/workdir/

WORKDIR /opt/workdir
COPY . /opt/workdir
RUN npm run build

EXPOSE 10010

CMD ["npm", "start"]