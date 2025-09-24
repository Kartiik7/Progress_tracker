const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    githubUsername: { type: String, default: "" },
    leetcodeUsername: { type: String, default: "" },
    theme: { type: String, default: "light" } // --- ADD THIS LINE ---
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  settings: { type: SettingsSchema, default: {} },
  newEmail: { type: String, sparse: true }, 
  emailChangeToken: { type: String, sparse: true }
});

module.exports = mongoose.model('User', UserSchema);