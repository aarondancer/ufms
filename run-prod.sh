PUBLIC_PORT=${PUBLIC_PORT:-80}
HOST_ARCH=${HOST_ARCH:-amd64}
docker stop d424-backend d424-frontend
docker rm d424-backend d424-frontend
docker run -d -p 4000:4000 --pull=always --platform linux/$HOST_ARCH --name d424-backend -e NODE_ENV='production' --env-file ./.env aarondancer/d424:backend
docker run -d -p $PUBLIC_PORT:3000 --pull=always --platform linux/$HOST_ARCH --add-host=host.docker.internal:host-gateway -e NODE_ENV='production' --name d424-frontend aarondancer/d424:frontend

