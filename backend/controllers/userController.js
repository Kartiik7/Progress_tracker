const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Ensure settings is always an object
    if (!user.settings) user.settings = {};
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// ... other functions ...

// Update user profile (settings for usernames AND theme)
exports.updateProfile = async (req, res) => {
    try {
        // --- MODIFIED: Include theme in the destructured request body ---
        const { leetcodeUsername, githubUsername, theme } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.settings) {
            user.settings = {};
        }

        // --- MODIFIED: Update settings object conditionally ---
        if (leetcodeUsername !== undefined) {
            user.settings.leetcodeUsername = leetcodeUsername;
        }
        if (githubUsername !== undefined) {
            user.settings.githubUsername = githubUsername;
        }
        if (theme !== undefined) { // <-- Add this block
            user.settings.theme = theme;
        }

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// ... other functions ...

// --- NEW: Request to change email ---
exports.requestEmailChange = async (req, res) => {
    try {
        const { newEmail, password } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 1. Verify user's current password for security
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // 2. Check if the new email is already in use
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email address is already in use.' });
        }

        // 3. Generate a secure token and save it with the new email
        const token = crypto.randomBytes(32).toString('hex');
        user.newEmail = newEmail;
        user.emailChangeToken = token;
        await user.save();

        // --- TODO: In a real app, send an email with this token ---
        console.log(`Email change token for ${newEmail}: ${token}`);
        // ---

        res.json({ message: `A verification link has been sent to ${newEmail}. Please check your inbox.` });

    } catch (err) {
        console.error('Error requesting email change:', err);
        res.status(500).json({ message: 'Server error while requesting email change.' });
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