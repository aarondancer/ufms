USERNAME=${USERNAME:-aarondancer}
docker buildx build --push ./backend --platform linux/amd64,linux/arm64 -t $USERNAME/d424:backend
docker buildx build --push ./frontend --platform linux/amd64,linux/arm64 -t $USERNAME/d424:frontend
