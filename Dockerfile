# Use the appropriate Node.js base image
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the Prisma schema
COPY prisma ./prisma/

# Run Prisma generate
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD [ "npm", "start" ]
