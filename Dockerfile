FROM node:12.16.1

WORKDIR /node
COPY . /node
RUN find /node/container -type f -name "*.sh" -exec chmod +x {} + && \
    /node/container/install.sh && \
    rm -rf /node/container/install.sh

FROM node:12-buster-slim as builder
WORKDIR /node

ENV PATH /node/node_modules/.bin:$PATH

COPY --from=0 /node/node_modules /node/node_modules
COPY . /node

RUN find /node/container -type f -name "*.sh" -exec chmod +x {} + && \
    /node/container/build.sh && \
    rm -rf /node/container/build.sh

FROM  nginx:alpine
COPY --from=builder /node/build /usr/share/nginx/html
COPY ./container/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]  