FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG SITE_URL=http://127.0.0.1:3000
ARG SITE_INDEXABLE=false
ENV SITE_URL=$SITE_URL SITE_INDEXABLE=$SITE_INDEXABLE
RUN npm run postinstall && npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 CONTENT_DB=/data/content.sqlite ADMIN_LOCAL_PREVIEW=false CONTENT_AUTOMATION_ENABLED=false
COPY --from=build /app/.output ./.output
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/server/lib ./server/lib
COPY --from=build /app/shared ./shared
COPY --from=build /app/content ./content
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
