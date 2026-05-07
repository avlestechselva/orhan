const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  cover_image: { type: String, default: '/images/noimage.jpg' },
  cover_image_id: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);
