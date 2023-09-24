FROM oven/bun:latest AS build

# Install git, this is for husky and bun prepare to work
RUN apt-get -y update
RUN apt-get -y install git

# Make a copy of the .env file
RUN bun run env

# Install dependencies
COPY package.json .
RUN bun install

# Copy source code
COPY . .

# Run the app
CMD ["bun", "start"]
