FROM node:22-slim

RUN npm install -g pnpm@10.33.2

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000 3001

CMD ["pnpm", "dev"]
