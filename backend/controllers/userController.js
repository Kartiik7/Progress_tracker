const User = require('../models/User.js');
const bcrypt = require('bcryptjs');

// Get current user's profile and settings
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user settings (e.g., LeetCode username)
exports.updateUserSettings = async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.settings.leetcodeUsername = leetcodeUsername;
    await user.save();
    res.json({ message: 'Settings updated successfully', settings: user.settings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
