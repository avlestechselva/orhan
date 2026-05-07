const Resource = require('../models/Resource');
const { resourceUpload, cloudinary } = require('../config/multer');

const ADMIN_LAYOUT = { layout: 'layout/admin' };

exports.index = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.render('admin/resource/index', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Resources', resources });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.create = (req, res) => {
  res.render('admin/resource/create', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Create Resource' });
};

exports.store = (req, res) => {
  resourceUpload(req, res, async (err) => {
    if (err) return res.redirect('/resourceSection/create?error=' + encodeURIComponent(err.message));

    const { name, description } = req.body;
    if (!name) return res.redirect('/resourceSection/create?error=Name+is+required');

    try {
      await Resource.create({
        name,
        description,
        file: req.file ? req.file.path : null,
        file_id: req.file ? req.file.filename : null,
      });
      res.redirect('/resourceSection?success=' + encodeURIComponent('The File has been successfully created!'));
    } catch (err) {
      res.redirect('/resourceSection/create?error=' + encodeURIComponent(err.message));
    }
  });
};

exports.edit = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).send('Not found');
    res.render('admin/resource/edit', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Edit Resource', resource });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.update = (req, res) => {
  resourceUpload(req, res, async (err) => {
    if (err) return res.redirect(`/resourceSection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));

    const { name, description } = req.body;
    try {
      const update = { name, description };
      if (req.file) {
        const existing = await Resource.findById(req.params.id);
        if (existing && existing.file_id) {
          await cloudinary.uploader.destroy(existing.file_id, { resource_type: 'raw' }).catch(() => {});
        }
        update.file = req.file.path;
        update.file_id = req.file.filename;
      }
      await Resource.findByIdAndUpdate(req.params.id, update);
      res.redirect('/resourceSection?success=' + encodeURIComponent('The File has been successfully updated!'));
    } catch (err) {
      res.redirect(`/resourceSection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
    }
  });
};

exports.destroy = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).send('Not found');

    if (resource.file_id) {
      await cloudinary.uploader.destroy(resource.file_id, { resource_type: 'raw' }).catch(() => {});
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.redirect('/resourceSection?success=' + encodeURIComponent('The File record has been deleted!'));
  } catch (err) {
    res.status(500).send(err.message);
  }
};
