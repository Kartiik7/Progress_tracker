const Task = require('../models/Task.js');
const Project = require('../models/Projects.js');
const Book = require('../models/Book.js');
const User = require('../models/User.js');
const axios = require('axios');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.userId;

        // --- CRITICAL FIX ---
        // First, find the user and ensure they exist before proceeding.
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // --- Date Calculations ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // End of today

        const nextSevenDays = new Date();
        nextSevenDays.setDate(today.getDate() + 7);
        nextSevenDays.setHours(23, 59, 59, 999); // End of the 7th day

        // --- Parallel Data Fetching ---
        const [
            todaysTasks,
            upcomingDeadlines,
            currentlyReadingBook,
            finishedBookCount
        ] = await Promise.all([
            // 1. Get tasks due today
            Task.find({
                userId,
                dueDate: { $gte: today, $lte: endOfToday },
                status: 'pending'
            }).sort({ dueDate: 1 }),

            // 2. Get tasks and projects due in the next 7 days (but not today)
            Task.find({
                userId,
                dueDate: { $gt: endOfToday, $lte: nextSevenDays },
                status: 'pending'
            }).sort({ dueDate: 1 }),

            // 3. Get the book currently being read
            Book.findOne({ userId, status: 'reading' }),

            // 4. Get the count of finished books
            Book.countDocuments({ userId, status: 'finished' })
        ]);

        // --- LeetCode Stats Fetching (Conditional) ---
        let leetcodeStats = { totalSolved: 'N/A' };
        if (user.settings && user.settings.leetcodeUsername) {
            try {
                const leetcodeRes = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${user.settings.leetcodeUsername}`);
                if (leetcodeRes.data && leetcodeRes.data.totalSolved) {
                    leetcodeStats.totalSolved = leetcodeRes.data.totalSolved;
                }
            } catch (e) {
                console.error("Failed to fetch LeetCode stats for dashboard:", e.message);
                leetcodeStats.totalSolved = 'Error'; // Indicate an API error
            }
        }

        // --- Assemble the final data object ---
        const dashboardData = {
            welcomeMessage: `Welcome back, ${user.email.split('@')[0]}!`,
            todaysTasks,
            upcomingDeadlines,
            quickStats: {
                leetcodeSolved: leetcodeStats.totalSolved,
                booksFinished: finishedBookCount,
            },
            currentlyReading: currentlyReadingBook,
        };

        res.json(dashboardData);

    } catch (error) {
        console.error('Dashboard data fetching error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard data.' });
    }
};

