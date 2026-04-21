FROM node:20-slim

RUN npm install -g pnpm@10.14.0

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000 3001

CMD ["pnpm", "dev"]
