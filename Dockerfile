FROM alpine
WORKDIR /usr/src/app

COPY api/build/ /bin/
COPY app/build public

CMD ["/bin/api"]
