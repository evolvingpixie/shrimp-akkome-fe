FROM node:20 AS builder
WORKDIR /build

#RUN git clone https://akkoma.dev/AkkomaGang/akkoma-fe.git ./ 
#COPY ./config.json /build/static/config.json
COPY ./ .
RUN yarn
RUN npm run build


FROM nginx:alpine
LABEL org.opencontainers.image.authors="@phoenix_fairy@thetransagenda.gay"
LABEL org.opencontainers.image.source="https://github.com/evolvingpixie/shrimp-akkome-fe"
LABEL org.opencontainers.image.url="https://akkoma.dev/esm/akkoma-fe"

COPY --from=builder /build/dist /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
