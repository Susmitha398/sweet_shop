const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  tagline: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  badge: { type: String, default: 'Authentic Recipe' },
  displayOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
