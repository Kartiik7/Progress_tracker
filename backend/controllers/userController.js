const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// Update user profile (settings for usernames)
exports.updateProfile = async (req, res) => {
    try {
        const { leetcodeUsername, githubUsername } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // FIX: Ensure the settings object exists before assignment
        if (!user.settings) {
            user.settings = {};
        }

        // Update settings
        user.settings.leetcodeUsername = leetcodeUsername;
        user.settings.githubUsername = githubUsername;

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating profile:', err); // Added for better debugging
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error while changing password.' });
    }
};


// Verify password for sensitive actions
exports.verifyPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        res.json({ success: true, message: 'Password verified' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during password verification.' });
    }
};

