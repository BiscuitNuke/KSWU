# CI packages the already validated export; it does not fetch content or rebuild.
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY out /usr/share/nginx/html
# The live feed (feed/feed.py) runs from this same image as a second service.
USER root
RUN apk add --no-cache python3 && install -d -o 101 -g 101 /live
COPY feed/feed.py /feed/feed.py
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
