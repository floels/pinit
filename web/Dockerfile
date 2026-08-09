FROM node:22-slim

RUN npm install -g pnpm@10.33.2

# `/app` is a bind mount at run time, so pnpm puts the store in `/app` and
# writes it to the host. Pin the store to a fixed path outside the mount. The
# path is also part of the compatibility check on `node_modules`, so the same
# value must apply to the build and to the container.
RUN pnpm config set --global store-dir /pnpm-store

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000 3001

CMD ["pnpm", "dev"]
