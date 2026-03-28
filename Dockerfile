FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY src/ src/
RUN mkdir -p dist && npm run build

FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built PWA files
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1
