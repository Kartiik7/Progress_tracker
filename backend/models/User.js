const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    githubUsername: { type: String, default: "" },
    leetcodeUsername: { type: String, default: "" }
  },
  { _id: false } // ✅ correctly closes here
);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  settings: { type: SettingsSchema, default: {} } // ✅ this now works
});

module.exports = mongoose.model('User', UserSchema);
