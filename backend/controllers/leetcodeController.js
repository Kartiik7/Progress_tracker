const User = require('../models/User.js');
const axios = require('axios');

exports.getStats = async (req, res) => {
  try {
    // 1. Get the logged-in user from the database
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 2. Check if they have a LeetCode username saved
    const leetcodeUsername = user.settings?.leetcodeUsername;
    if (!leetcodeUsername) {
      return res.status(400).json({ message: 'No LeetCode username is set for this user.' });
    }

    // 3. Fetch stats using the saved username
    const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${leetcodeUsername}`);
    
    // 4. Check for API errors (e.g., username not found on LeetCode)
    if (response.data.errors) {
        return res.status(404).json({ message: `Could not fetch stats for "${leetcodeUsername}". Please check the username in your settings.` });
    }

    // 5. Send the data back to the frontend
    res.json(response.data);

  } catch (error) {
    console.error('Error fetching LeetCode stats:', error.message);
    const username = (await User.findById(req.userId))?.settings?.leetcodeUsername || 'your account';
    res.status(500).json({ message: `An external API error occurred while fetching stats for ${username}. The service may be temporarily down.` });
  }
};

