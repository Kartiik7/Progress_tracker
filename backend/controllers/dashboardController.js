const Task = require('../models/Task');
const Project = require('../models/Projects');
const Book = require('../models/Book');
const User = require('../models/User');
const axios = require('axios');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.userId;

        // --- 1. Define Date Ranges Correctly ---
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(todayStart.getDate() + 1);

        const nextSevenDaysEnd = new Date(todayStart);
        nextSevenDaysEnd.setDate(todayStart.getDate() + 7);

        // --- 2. Fetch Today's Tasks ---
        const todaysTasksPromise = Task.find({
            userId,
            dueDate: { $gte: todayStart, $lte: todayEnd },
            status: 'pending'
        }).sort({ dueDate: 1 });

        // --- 3. Fetch Upcoming Deadlines (Next 7 Days) ---
        const upcomingTasksPromise = Task.find({
            userId,
            dueDate: { $gte: tomorrowStart, $lte: nextSevenDaysEnd },
            status: 'pending'
        }).sort({ dueDate: 1 }).limit(5);

        const upcomingProjectsPromise = Project.find({
            userId,
            dueDate: { $gte: tomorrowStart, $lte: nextSevenDaysEnd },
            status: 'pending'
        }).sort({ dueDate: 1 }).limit(5);

        // --- 4. Fetch Book & User Stats ---
        const booksFinishedPromise = Book.countDocuments({ userId, status: 'finished' });
        const currentlyReadingPromise = Book.findOne({ userId, status: 'reading' });
        const userPromise = User.findById(userId);

        // --- Execute all promises in parallel ---
        const [
            todaysTasks,
            upcomingTasks,
            upcomingProjects,
            booksFinished,
            currentlyReading,
            user
        ] = await Promise.all([
            todaysTasksPromise,
            upcomingTasksPromise,
            upcomingProjectsPromise,
            booksFinishedPromise,
            currentlyReadingPromise,
            userPromise
        ]);

        // --- 5. Fetch LeetCode Stats (if username is saved) ---
        let leetCodeSolved = null;
        if (user?.settings?.leetcodeUsername) {
            try {
                const leetcodeRes = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${user.settings.leetcodeUsername}`);
                if (leetcodeRes.data?.totalSolved) {
                    leetCodeSolved = leetcodeRes.data.totalSolved;
                }
            } catch (leetError) {
                console.error("Could not fetch LeetCode stats for dashboard:", leetError.message);
                leetCodeSolved = 'Error';
            }
        }

        const upcomingDeadlines = [...upcomingTasks, ...upcomingProjects]
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        let currentlyReadingData = null;
        if (currentlyReading) {
            currentlyReadingData = {
                title: currentlyReading.title,
                currentPage: currentlyReading.currentPage,
                totalPages: currentlyReading.totalPages,
                progressPercent: currentlyReading.totalPages > 0 ? Math.round((currentlyReading.currentPage / currentlyReading.totalPages) * 100) : 0
            };
        }

        // --- 6. Send Final Response ---
        res.json({
            user: { email: user.email },
            todaysTasks,
            upcomingDeadlines,
            booksFinished,
            currentlyReading: currentlyReadingData,
            leetCodeSolved,
        });

    } catch (error) {
        console.error('Dashboard data fetching error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data.' });
    }
};

