const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  description: { type: String },
  body: { type: String },
  cover_image: { type: String, default: '/images/noimage.jpg' },
  cover_image_id: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
