FROM node:12.15.0

ARG BUILD_ENV=production

RUN mkdir -p /elon-hood

WORKDIR /elon-hood/

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install --$BUILD_ENV

COPY . /elon-hood/

CMD ["sh", "-c", "node src/index "]
