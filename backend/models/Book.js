const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  coverImage: { type: String }, // URL to a book cover
  status: {
    type: String,
    enum: ['to-read', 'reading', 'finished', 'dnf'], // Added 'dnf'
    default: 'to-read'
  },
  currentPage: { type: Number, default: 0 },
  totalPages: { type: Number, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 }, // Added rating
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);