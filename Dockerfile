FROM node:14.8.0

ARG BUILD_ENV=production

EXPOSE 8000

WORKDIR /elon-hood/

COPY .npmrc package.json package-lock.json ./
RUN npm install --$BUILD_ENV

COPY . /elon-hood/

CMD ["sh", "-c", "node src/index "]
