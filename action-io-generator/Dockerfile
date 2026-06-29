FROM node:24-alpine

COPY ./entrypoint.sh /entrypoint.sh

RUN apk --no-cache add git bash
    
ENTRYPOINT [ "/entrypoint.sh" ]
