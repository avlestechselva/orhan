const mongoose = require('mongoose');

const GalleryImageSchema = new mongoose.Schema({
  gallery_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery', required: true },
  image: { type: String, required: true },
  image_id: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);
