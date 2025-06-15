
# Use an official Puppeteer base image that comes with Chrome pre-installed
FROM ghcr.io/puppeteer/puppeteer:23.0.0

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies as root (we need dev dependencies for TypeScript build)
USER root

# Install Chrome dependencies and update Chrome installation
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies and clean cache
RUN npm install && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Now remove dev dependencies to keep image size down
RUN npm prune --production

# Create directories and set permissions for pptruser BEFORE switching users
RUN mkdir -p /home/pptruser/Downloads \
    && mkdir -p /home/pptruser/.cache/puppeteer \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Switch to non-root user BEFORE installing Chrome
USER pptruser

# Install Chrome browsers using Puppeteer as pptruser so it goes to the right location
RUN npx puppeteer browsers install chrome@stable

# Verify Chrome installation in the correct location
RUN ls -la /home/pptruser/.cache/puppeteer/

# Expose the port your app runs on (aligned with default PORT)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
