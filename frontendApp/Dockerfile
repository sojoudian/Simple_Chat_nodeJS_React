# Use node image for building and serving the React frontend
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire frontend codebase
COPY . .

# Build the React app
RUN npm run build

# Install and use a simple HTTP server to serve the build
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the built React app
CMD ["serve", "-s", "build", "-l", "3000"]
