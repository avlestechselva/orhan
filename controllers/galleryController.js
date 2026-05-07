const Gallery = require('../models/Gallery');
const GalleryImage = require('../models/GalleryImage');
const { galleryUpload, cloudinary } = require('../config/multer');

const ADMIN_LAYOUT = { layout: 'layout/admin' };

exports.index = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.render('admin/gallery/index', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Orhan Galleries', galleries });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.create = (req, res) => {
  res.render('admin/gallery/create', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Create Gallery' });
};

exports.store = (req, res) => {
  galleryUpload(req, res, async (err) => {
    if (err) return res.redirect('/gallerySection/create?error=' + encodeURIComponent(err.message));

    const { name } = req.body;
    if (!name) return res.redirect('/gallerySection/create?error=Gallery+name+is+required');

    try {
      await Gallery.create({
        name,
        cover_image: req.file ? req.file.path : '/images/noimage.jpg',
        cover_image_id: req.file ? req.file.filename : null,
      });
      res.redirect('/gallerySection?success=' + encodeURIComponent('Orhan Gallery successfully created!'));
    } catch (err) {
      res.redirect('/gallerySection/create?error=' + encodeURIComponent(err.message));
    }
  });
};

exports.edit = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).send('Not found');
    res.render('admin/gallery/edit', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Edit Gallery', gallery });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.update = (req, res) => {
  galleryUpload(req, res, async (err) => {
    if (err) return res.redirect(`/gallerySection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));

    const { name } = req.body;
    if (!name) return res.redirect(`/gallerySection/${req.params.id}/edit?error=Gallery+name+is+required`);

    try {
      const update = { name };
      if (req.file) {
        const existing = await Gallery.findById(req.params.id);
        if (existing && existing.cover_image_id) {
          await cloudinary.uploader.destroy(existing.cover_image_id).catch(() => {});
        }
        update.cover_image = req.file.path;
        update.cover_image_id = req.file.filename;
      }
      await Gallery.findByIdAndUpdate(req.params.id, update);
      res.redirect('/gallerySection?success=' + encodeURIComponent('Orhan Gallery has been updated!'));
    } catch (err) {
      res.redirect(`/gallerySection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
    }
  });
};

exports.destroy = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).send('Not found');

    if (gallery.cover_image_id) {
      await cloudinary.uploader.destroy(gallery.cover_image_id).catch(() => {});
    }

    const images = await GalleryImage.find({ gallery_id: gallery._id });
    for (const img of images) {
      if (img.image_id) {
        await cloudinary.uploader.destroy(img.image_id).catch(() => {});
      }
    }
    await GalleryImage.deleteMany({ gallery_id: gallery._id });
    await Gallery.findByIdAndDelete(req.params.id);

    res.redirect('/gallerySection?success=' + encodeURIComponent('The Gallery Name and Images are removed!'));
  } catch (err) {
    res.status(500).send(err.message);
  }
};
