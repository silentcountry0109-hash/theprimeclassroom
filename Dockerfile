# The Prime 質數教室 — Cloud Run 映像檔
FROM node:22-slim AS base
WORKDIR /app

# 安裝相依(含 build 需要的 devDependencies)。
# 原生模組(sharp / bcryptjs / pg)會在容器內針對 Linux 重新編譯。
COPY package.json package-lock.json ./
RUN npm ci

# 複製原始碼(uploads/ 內既有的圖片與 PDF 會一起進映像檔)
COPY . .

# 前端有用到的 VITE_ 變數在 build 階段就會被內嵌(此為公開的 LINE 加好友連結)
ARG VITE_LINE_OA_URL=https://line.me/R/ti/p/@643apwlp
ENV VITE_LINE_OA_URL=$VITE_LINE_OA_URL

# LIFF app ID(非機密;建於 Login channel 2009943763 底下——與 web OAuth 同 channel,
# 已註冊家長的 lineUserId 才會一致。切勿另設 LIFF_LOGIN_CHANNEL_ID)
ARG VITE_LIFF_ID=2009943763-Oor4CAs4
ENV VITE_LIFF_ID=$VITE_LIFF_ID

# 建置 client(dist/public)與 server(dist/index.cjs)
RUN npm run build

ENV NODE_ENV=production
# Cloud Run 會注入 PORT(預設 8080),server/index.ts 會讀取
EXPOSE 8080
CMD ["node", "dist/index.cjs"]
