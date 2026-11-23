#!/usr/bin/env bash
set -euo pipefail

image=${1:-kswu-check}
name=kswu-check-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}
docker run -d --name "$name" --read-only --tmpfs /tmp:rw,size=32m,mode=1777 --cap-drop ALL --security-opt no-new-privileges --pids-limit 100 --memory 128m -p 127.0.0.1:8088:8080 "$image"
cleanup() {
    docker logs "$name"
    docker rm -f "$name" >/dev/null
}
trap cleanup EXIT

origin=http://127.0.0.1:8088
curl --fail --retry 10 --retry-connrefused --retry-delay 1 "$origin/healthz"
for route in / /projects/ /projects/raskal/ /projects/hamlab/ /projects/wannacry/ /contact/ /resume/ /activity.json; do
    curl --fail --silent --show-error "$origin$route" >/dev/null
done
# Next's trailingSlash export creates route/index.html. nginx should redirect the
# directory URL and serve it, while missing pages/assets retain HTTP 404.
test "$(curl -s -o /dev/null -w '%{http_code}' "$origin/projects")" = 301
for route in /route-must-not-exist-827491 /projects/does-not-exist/ /_next/static/missing.js; do
    test "$(curl -s -o /dev/null -w '%{http_code}' "$origin$route")" = 404
done
test "$(docker exec "$name" id -u)" != 0
docker exec "$name" nginx -t
