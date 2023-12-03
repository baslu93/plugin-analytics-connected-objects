FROM salesforce/cli:latest-full
WORKDIR /plugin
COPY . .
RUN sf plugins link .