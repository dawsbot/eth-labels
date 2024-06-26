# Use the offical Bun image
FROM oven/bun as base

# Set the Docker working directory as /usr/src/app
# Copy everything from here into Docker's /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

FROM base AS install
RUN cd /usr/src/app && bun install --frozen-lockfile

# The port that Elysia will listen on
EXPOSE 3000

# Run the Elysia webserver
CMD bun run api/index.ts
