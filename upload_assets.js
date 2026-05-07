require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const Gallery = require('./models/Gallery');
const GalleryImage = require('./models/GalleryImage');
const News = require('./models/News');
const Resource = require('./models/Resource');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SRC = '/Users/selvakumarmaheshwarasarma/Documents/orhan/public/Uploads';

const upload = (filePath, folder, resourceType = 'image') =>
  cloudinary.uploader.upload(filePath, { folder, resource_type: resourceType });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // --- News cover images ---
  const newsDocs = await News.find({ cover_image: { $not: /^https?:\/\// } });
  console.log(`News to update: ${newsDocs.length}`);
  for (const doc of newsDocs) {
    const filePath = path.join(SRC, 'news_cover_images', doc.cover_image);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (file not found): ${doc.cover_image}`);
      continue;
    }
    try {
      const result = await upload(filePath, 'orhan/news');
      await News.findByIdAndUpdate(doc._id, {
        cover_image: result.secure_url,
        cover_image_id: result.public_id,
      });
      console.log(`  ✓ News: ${doc.title}`);
    } catch (e) {
      console.log(`  ✗ News failed: ${doc.title} — ${e.message}`);
    }
  }

  // --- Gallery cover images ---
  const galleryDocs = await Gallery.find({ cover_image: { $not: /^https?:\/\// } });
  console.log(`\nGalleries to update: ${galleryDocs.length}`);
  for (const doc of galleryDocs) {
    const filePath = path.join(SRC, 'gallery_cover_images', doc.cover_image);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (file not found): ${doc.cover_image}`);
      continue;
    }
    try {
      const result = await upload(filePath, 'orhan/gallery_covers');
      await Gallery.findByIdAndUpdate(doc._id, {
        cover_image: result.secure_url,
        cover_image_id: result.public_id,
      });
      console.log(`  ✓ Gallery: ${doc.name}`);
    } catch (e) {
      console.log(`  ✗ Gallery failed: ${doc.name} — ${e.message}`);
    }
  }

  // --- Gallery images ---
  const imgDocs = await GalleryImage.find({ image: { $not: /^https?:\/\// } });
  console.log(`\nGallery images to update: ${imgDocs.length}`);
  for (const doc of imgDocs) {
    const filePath = path.join(SRC, 'gallery_images', doc.image);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (file not found): ${doc.image}`);
      continue;
    }
    try {
      const result = await upload(filePath, 'orhan/gallery_images');
      await GalleryImage.findByIdAndUpdate(doc._id, {
        image: result.secure_url,
        image_id: result.public_id,
      });
      console.log(`  ✓ Image: ${doc.image}`);
    } catch (e) {
      console.log(`  ✗ Image failed: ${doc.image} — ${e.message}`);
    }
  }

  // --- Resource documents ---
  const resourceDocs = await Resource.find({ file: null });
  const resourceFiles = fs.readdirSync(path.join(SRC, 'resource_documents'));
  console.log(`\nResources to update: ${resourceDocs.length}`);
  for (const doc of resourceDocs) {
    // Match by name similarity since file field was cleared during migration
    const match = resourceFiles.find(f =>
      f.toLowerCase().includes(doc.name.toLowerCase().slice(0, 10))
    );
    if (!match) {
      console.log(`  SKIP (no matching file for): ${doc.name}`);
      continue;
    }
    const filePath = path.join(SRC, 'resource_documents', match);
    try {
      const result = await upload(filePath, 'orhan/resources', 'raw');
      await Resource.findByIdAndUpdate(doc._id, {
        file: result.secure_url,
        file_id: result.public_id,
      });
      console.log(`  ✓ Resource: ${doc.name}`);
    } catch (e) {
      console.log(`  ✗ Resource failed: ${doc.name} — ${e.message}`);
    }
  }

  console.log('\nAll done!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Upload failed:', err.message);
  process.exit(1);
});
