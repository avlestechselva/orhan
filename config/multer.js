const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: { folder, allowed_formats: ['jpg', 'jpeg', 'png'] },
});

const rawStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: { folder, resource_type: 'raw' },
});

const imageFilter = (req, file, cb) => {
  if (/jpeg|jpg|png/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG/PNG images allowed'));
};

exports.newsUpload = multer({
  storage: imageStorage('orhan/news'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('cover_image');

exports.galleryUpload = multer({
  storage: imageStorage('orhan/gallery_covers'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('gallery_cover_image');

exports.galleryImageUpload = multer({
  storage: imageStorage('orhan/gallery_images'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).array('gallery_image', 20);

exports.galleryImageSingleUpload = multer({
  storage: imageStorage('orhan/gallery_images'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('gallery_image');

exports.resourceUpload = multer({
  storage: rawStorage('orhan/resources'),
  limits: { fileSize: 3 * 1024 * 1024 },
}).single('image');

exports.cloudinary = cloudinary;
