const Gallery = require('../models/Gallery');
const GalleryImage = require('../models/GalleryImage');
const { galleryImageUpload, galleryImageSingleUpload, cloudinary } = require('../config/multer');

const ADMIN_LAYOUT = { layout: 'layout/admin' };

exports.index = async (req, res) => {
  try {
    const [galleries, gallery_images] = await Promise.all([
      Gallery.find(),
      GalleryImage.find().populate('gallery_id').sort({ createdAt: -1 }),
    ]);
    res.render('admin/galleryImage/index', { ...ADMIN_LAYOUT,
      pagetitle: 'Dashboard - Orhan Gallery Images',
      galleries,
      gallery_images,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const galleries = await Gallery.find();
    res.render('admin/galleryImage/create', { ...ADMIN_LAYOUT,
      pagetitle: 'Dashboard - Upload Gallery Images',
      galleries,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.store = (req, res) => {
  galleryImageUpload(req, res, async (err) => {
    if (err) return res.redirect('/galleryImageSection/create?error=' + encodeURIComponent(err.message));

    const { gallery_name, description } = req.body;
    if (!gallery_name || gallery_name === '0') {
      return res.redirect('/galleryImageSection/create?error=The+gallery+name+field+is+required.');
    }
    if (!req.files || req.files.length === 0) {
      return res.redirect('/galleryImageSection/create?error=Please+select+at+least+one+image');
    }

    try {
      const gallery = await Gallery.findById(gallery_name);
      if (!gallery) return res.redirect('/galleryImageSection/create?error=Gallery+not+found');

      const docs = req.files.map((file) => ({
        gallery_id: gallery._id,
        image: file.path,
        image_id: file.filename,
        description,
      }));
      await GalleryImage.insertMany(docs);

      res.redirect('/galleryImageSection?success=' + encodeURIComponent(`${gallery.name} Images successfully Uploaded!`));
    } catch (err) {
      res.redirect('/galleryImageSection/create?error=' + encodeURIComponent(err.message));
    }
  });
};

exports.edit = async (req, res) => {
  try {
    const [galleryImg, galleries] = await Promise.all([
      GalleryImage.findById(req.params.id).populate('gallery_id'),
      Gallery.find(),
    ]);
    if (!galleryImg) return res.status(404).send('Not found');
    res.render('admin/galleryImage/edit', { ...ADMIN_LAYOUT,
      pagetitle: 'Dashboard - Edit Gallery Images',
      galleryImg,
      galleries,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.update = (req, res) => {
  galleryImageSingleUpload(req, res, async (err) => {
    if (err) return res.redirect(`/galleryImageSection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));

    const { gallery_name, description } = req.body;
    if (!gallery_name || gallery_name === '0') {
      return res.redirect(`/galleryImageSection/${req.params.id}/edit?error=The+gallery+name+field+is+required.`);
    }

    try {
      const gallery = await Gallery.findById(gallery_name);
      if (!gallery) return res.redirect(`/galleryImageSection/${req.params.id}/edit?error=Gallery+not+found`);

      const update = { gallery_id: gallery._id, description };
      if (req.file) {
        const existing = await GalleryImage.findById(req.params.id);
        if (existing && existing.image_id) {
          await cloudinary.uploader.destroy(existing.image_id).catch(() => {});
        }
        update.image = req.file.path;
        update.image_id = req.file.filename;
      }
      await GalleryImage.findByIdAndUpdate(req.params.id, update);

      res.redirect('/galleryImageSection?success=' + encodeURIComponent(`${gallery.name} Image has been successfully updated!`));
    } catch (err) {
      res.redirect(`/galleryImageSection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
    }
  });
};

exports.destroy = async (req, res) => {
  try {
    const img = await GalleryImage.findById(req.params.id).populate('gallery_id');
    if (!img) return res.status(404).send('Not found');

    if (img.image_id) {
      await cloudinary.uploader.destroy(img.image_id).catch(() => {});
    }

    const galleryName = img.gallery_id ? img.gallery_id.name : 'Gallery';
    await GalleryImage.findByIdAndDelete(req.params.id);

    res.redirect('/galleryImageSection?success=' + encodeURIComponent(`The ${galleryName} Image Removed!`));
  } catch (err) {
    res.status(500).send(err.message);
  }
};
