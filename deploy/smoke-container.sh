#!/usr/bin/env bash
set -euo pipefail

image=${1:-kswu-check}
name=kswu-check-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}
cleanup() {
    local status=$?
    set +e
    if [ "$status" -ne 0 ]; then
        echo "Container smoke test failed (exit $status). Container state:"
        docker inspect --format '{{json .State}}' "$name"
        echo 'Container logs:'
        docker logs "$name"
    fi
    docker rm -f "$name" >/dev/null
    exit "$status"
}
trap cleanup EXIT
docker run -d --name "$name" --read-only --tmpfs /tmp:rw,size=32m,mode=1777 --cap-drop ALL --security-opt no-new-privileges --pids-limit 100 --memory 128m -p 127.0.0.1:8088:8080 "$image"

origin=http://127.0.0.1:8088
ready=false
# A newly published Docker port can accept and reset connections before nginx
# listens. Retry all startup failures, including curl exit 56, for at most 44s.
for attempt in {1..15}; do
    if curl --fail --silent --show-error --connect-timeout 1 --max-time 2 "$origin/healthz" >/dev/null; then
        ready=true
        break
    fi
    if [ "$(docker inspect --format '{{.State.Running}}' "$name")" != true ]; then
        echo 'Container exited before becoming ready.' >&2
        break
    fi
    if [ "$attempt" -lt 15 ]; then sleep 1; fi
done
if [ "$ready" != true ]; then
    echo 'Container did not become ready within the startup retry window.' >&2
    exit 1
fi

request_limits=(--connect-timeout 2 --max-time 5)
for route in / /projects/ /projects/raskal/ /projects/hamlab/ /projects/wannacry/ /contact/ /resume/ /activity.json; do
    curl "${request_limits[@]}" --fail --silent --show-error "$origin$route" >/dev/null
done
# Next's trailingSlash export creates route/index.html. nginx should redirect the
# directory URL and serve it, while missing pages/assets retain HTTP 404.
test "$(curl "${request_limits[@]}" -s -o /dev/null -w '%{http_code}' "$origin/projects")" = 301
for route in /route-must-not-exist-827491 /projects/does-not-exist/ /_next/static/missing.js; do
    test "$(curl "${request_limits[@]}" -s -o /dev/null -w '%{http_code}' "$origin$route")" = 404
done
test "$(docker exec "$name" id -u)" != 0
docker exec "$name" nginx -t
