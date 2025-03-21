// File: server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://10.0.0.192:3000'], // Allow both localhost and your network IP
    methods: ['GET', 'POST', 'OPTIONS'], // Added OPTIONS for preflight
    credentials: true // Allow credentials (cookies, authorization headers)
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.0.192:3000'], // Allow both localhost and your network IP
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// User Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Message Model
const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword
    });
    
    await newUser.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      username: newUser.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      username: user.username
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Message Routes
app.get('/api/messages/:recipient', authenticateToken, async (req, res) => {
  try {
    const { recipient } = req.params;
    const sender = req.user.username;
    
    // Get messages between users (in both directions)
    const messages = await Message.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, 'username');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle preflight requests
app.options('*', cors());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Authenticate socket connection
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      socket.user = decoded;
      socket.join(decoded.username); // Join a room with their username
      console.log(`User ${decoded.username} authenticated`);
    } catch (err) {
      console.error('Socket authentication failed:', err);
    }
  });
  
  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      if (!socket.user) {
        return;
      }
      
      const { recipient, content } = data;
      const sender = socket.user.username;
      
      // Save message to database
      const newMessage = new Message({
        sender,
        recipient,
        content
      });
      
      await newMessage.save();
      
      // Send message to recipient if they're online
      io.to(recipient).emit('receive_message', {
        sender,
        content,
        timestamp: newMessage.timestamp
      });
      
      // Also send confirmation back to sender
      socket.emit('message_sent', {
        id: newMessage._id,
        recipient,
        content,
        timestamp: newMessage.timestamp
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5001; 
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// File: .env (create this file in your project root)
// MONGO_URI=mongodb://localhost:27017/chatapp
// JWT_SECRET=test_secret_this_is_for_academic_purposes
// PORT=5001