# Use lightweight Docker image as this is simple frontend service
FROM nginx:mainline-alpine

# Copy static code from directory app to nginx's default folder
COPY app/ /usr/share/nginx/html

# Allow http connection to the server
EXPOSE 80
