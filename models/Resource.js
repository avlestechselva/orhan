const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  file: { type: String },
  file_id: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
