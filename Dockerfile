FROM salesforce/cli:latest-full
WORKDIR /plugin
COPY . .
RUN npm run compile
RUN sf plugins link .