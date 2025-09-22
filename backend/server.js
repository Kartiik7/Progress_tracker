const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const leetcodeRoutes = require('./routes/leetcode');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const githubRoutes = require('./routes/github'); // Import new GitHub routes

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/github', githubRoutes); // Use new GitHub routes

// Root route for health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to the StudyFlow API!',
    status: 'Server is running successfully.' 
  });
});

// ... your other API routes like app.use('/api/users', userRoutes) etc.

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));

