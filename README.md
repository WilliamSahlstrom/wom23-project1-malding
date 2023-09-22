# wom23-project1-malding

# Whiteboard App

A Node.js and Express-based application that serves as a whiteboard management system. This project utilizes MongoDB Atlas as the database service and Prisma as the ORM/ODM for database management. Users can authenticate, create, and manage boards.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Boards](#boards)
- [Endpoints](#endpoints)
- [License](#license)

## Features

- User authentication with JWT (JSON Web Tokens)
- Secure password storage using bcrypt
- Access control for boards and associated data
- Endpoints for board management
- Minimalist REST API design

## Getting Started

These instructions will help you set up the project on your local machine.

### Prerequisites

Make sure you have the following software/tools installed:

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Prisma](https://www.prisma.io/)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd wom23-project1-malding

2. Create a .env file in the project root directory and configure your environment variables, including the MongoDB Atlas connection string and JWT secret:

3. 
    ```bash
    npm start


## Usage

### Authentication

To authenticate, send a POST request to `/auth/login` with your credentials (email and password). Upon successful authentication, you will receive a JWT token that you can use for further requests.

### Boards

The `/boards` route is protected and requires a valid JWT token in the Authorization header. You can create, update, and delete boards using the appropriate HTTP methods (POST, PATCH, DELETE). Retrieve boards associated with the authenticated user by making a GET request to `/boards`.

## Endpoints

**Authentication:**

- `POST /auth/login`: User login endpoint.

**Boards:**

- `GET /boards`: Retrieve boards for the authenticated user.
- `POST /boards`: Create a new board.
- `PATCH /boards/:id`: Update a specific board.
- `DELETE /boards/:id`: Delete a specific board.

