# Use the official Nginx image
FROM nginx:alpine

# Copy the contents of the dist folder to the Nginx HTML directory
COPY dist /usr/share/nginx/html

# Expose port 80 for the server
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
