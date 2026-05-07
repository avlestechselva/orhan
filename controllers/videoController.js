const Video = require('../models/Video');

const ADMIN_LAYOUT = { layout: 'layout/admin' };

exports.index = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.render('admin/video/index', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Videos', videos });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.create = (req, res) => {
  res.render('admin/video/create', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Create Video Link' });
};

exports.store = async (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) return res.redirect('/videoSection/create?error=Title+and+URL+are+required');
  try {
    await Video.create({ title, url });
    res.redirect('/videoSection?success=' + encodeURIComponent('The Video link has been successfully created!'));
  } catch (err) {
    res.redirect('/videoSection/create?error=' + encodeURIComponent(err.message));
  }
};

exports.edit = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).send('Not found');
    res.render('admin/video/edit', { ...ADMIN_LAYOUT, pagetitle: 'Dashboard - Edit Video Link', video });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.update = async (req, res) => {
  const { title, url } = req.body;
  try {
    await Video.findByIdAndUpdate(req.params.id, { title, url });
    res.redirect('/videoSection?success=' + encodeURIComponent('The Video link has been successfully updated!'));
  } catch (err) {
    res.redirect(`/videoSection/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
};

exports.destroy = async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.redirect('/videoSection?success=' + encodeURIComponent('The video link has been deleted!'));
  } catch (err) {
    res.status(500).send(err.message);
  }
};
