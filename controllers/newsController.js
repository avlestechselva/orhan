const News = require('../models/News');
const { newsUpload, cloudinary } = require('../config/multer');

const ADMIN_LAYOUT = { layout: 'layout/admin' };

exports.index = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.render('admin/news/index', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - News', news });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.create = (req, res) => {
  res.render('admin/news/create', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Create News' });
};

exports.store = (req, res) => {
  newsUpload(req, res, async (err) => {
    if (err) return res.redirect('/newsSection/create?error=' + encodeURIComponent(err.message));

    const { title, author, description, body } = req.body;
    if (!title) return res.redirect('/newsSection/create?error=Title+is+required');

    try {
      await News.create({
        title,
        author,
        description,
        body,
        cover_image: req.file ? req.file.path : '/images/noimage.jpg',
        cover_image_id: req.file ? req.file.filename : null,
      });
      res.redirect('/newsSection?success=' + encodeURIComponent('The News has been successfully created!'));
    } catch (err) {
      res.redirect('/newsSection/create?error=' + encodeURIComponent(err.message));
    }
  });
};

exports.edit = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).send('Not found');
    res.render('admin/news/edit', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Edit News', news });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.update = (req, res) => {
  newsUpload(req, res, async (err) => {
    if (err) return res.redirect(`/newsSection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));

    const { title, author, description, body } = req.body;
    try {
      const update = { title, author, description, body };
      if (req.file) {
        const existing = await News.findById(req.params.id);
        if (existing && existing.cover_image_id) {
          await cloudinary.uploader.destroy(existing.cover_image_id).catch(() => {});
        }
        update.cover_image = req.file.path;
        update.cover_image_id = req.file.filename;
      }
      await News.findByIdAndUpdate(req.params.id, update);
      res.redirect('/newsSection?success=' + encodeURIComponent('The News post has been successfully updated!'));
    } catch (err) {
      res.redirect(`/newsSection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
    }
  });
};

exports.destroy = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).send('Not found');

    if (news.cover_image_id) {
      await cloudinary.uploader.destroy(news.cover_image_id).catch(() => {});
    }

    await News.findByIdAndDelete(req.params.id);
    res.redirect('/newsSection?success=' + encodeURIComponent('The News record has been deleted!'));
  } catch (err) {
    res.status(500).send(err.message);
  }
};
