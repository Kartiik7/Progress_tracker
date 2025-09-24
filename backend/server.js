const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const bookRoutes = require('./routes/books');
const leetcodeRoutes = require('./routes/leetcode');
const githubRoutes = require('./routes/github');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// --- NEW: CORS Configuration ---
// This whitelist contains all the URLs that are allowed to make requests to your API.
const whitelist = [
    'http://localhost:5173', // Your local frontend for development
    'https://stufyflow.netlify.app', // Your deployed frontend on Netlify
    'https://studflow.netlify.app'  
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
// --- End of CORS Configuration ---

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));

