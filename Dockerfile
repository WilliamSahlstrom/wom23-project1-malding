# Use an official Node.js runtime as a base image with Node.js 16
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port your application will run on
EXPOSE 3030

# Start your application
CMD ["npm", "start"]
