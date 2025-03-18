# Simple Chat Application

A real-time chat application built with Node.js, Express, Socket.IO, React, and MongoDB.

## Features

- User authentication (register and login)
- Real-time messaging between users
- Message history persistence
- User list display
- Responsive design for desktop and mobile

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) (v6.x or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation or MongoDB Atlas account)

## Project Structure

```
chat-app/
  ├── backend/         # Node.js server
  │   ├── server.js    # Express and Socket.IO server
  │   ├── .env         # Environment variables
  │   └── package.json # Backend dependencies
  │
  └── frontend/        # React client
      ├── public/      # Static files
      ├── src/         # React components
      └── package.json # Frontend dependencies
```
## Set up mongoDB using Docker
```bash
docker run -d --name mongo-chatapp -p 27017:27017 mongo:latest
```

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/sojoudian/Simple_Chat_nodeJS_React
cd chat-app
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGO_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_secure_jwt_secret
   PORT=5001
   ```
   Note: Replace `your_secure_jwt_secret` with a secure random string for production use.

4. Start the backend server:
   ```bash
   # For development with auto-restart
   npm install -g nodemon  # Install nodemon if you haven't already
   nodemon server.js
   
   # OR for regular start
   node server.js
   ```

   The server should start on port 5001.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   # From the project root
   cd frontend
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

   The React application should start on port 3000 and open automatically in your browser.

## Using the Application

1. Open your browser and navigate to `http://localhost:3000`

2. Register two different user accounts (use two different browsers or browser profiles to simulate two users)

3. Log in with each account

4. Select a user from the user list to start chatting

5. Send messages back and forth to see real-time communication

## Troubleshooting

### "Address already in use" Error

If you see this error when starting the backend:
```
Error: listen EADDRINUSE: address already in use :::5001
```

This means port 5001 is already being used by another application. You can:

1. Close the other application using port 5001, or
2. Change the port in the `.env` file and update the corresponding port in the frontend code (in the API and socket connection URLs)

### MongoDB Connection Issues

If you see MongoDB connection errors:

1. Make sure MongoDB is running on your system
2. Check if the connection URI in the `.env` file is correct
3. If using MongoDB Atlas, make sure your IP is whitelisted in the Atlas dashboard

## Technical Details

### Backend

- **Express**: HTTP server and REST API
- **Socket.IO**: Real-time bidirectional communication
- **Mongoose**: MongoDB object modeling
- **JSON Web Tokens (JWT)**: Authentication
- **bcrypt**: Password hashing

### Frontend

- **React**: UI library
- **React Router**: Navigation and routing
- **Axios**: HTTP client for API requests
- **Socket.IO Client**: Real-time communication with the server

## License

This project is licensed under the MIT License - see the LICENSE file for details.
