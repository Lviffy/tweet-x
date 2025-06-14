
# Use an official Puppeteer base image that comes with Chrome pre-installed
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies as root (the base image uses pptruser)
USER root
RUN npm install --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Create a non-root user and switch to it
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Switch to non-root user
USER pptruser

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
