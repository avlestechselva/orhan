const bcrypt = require('bcryptjs');
const User = require('../models/User');
const News = require('../models/News');
const Gallery = require('../models/Gallery');
const Resource = require('../models/Resource');

exports.index = async (req, res) => {
  try {
    const [newsCount, galleryCount, resourceCount] = await Promise.all([
      News.countDocuments(),
      Gallery.countDocuments(),
      Resource.countDocuments(),
    ]);
    res.render('admin/dashboard', {
      layout: 'layout/admin',
      pagetitle: 'ORHAN - Dashboard',
      newsCount,
      galleryCount,
      resourceCount,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.profile = (req, res) => {
  res.render('pages/profile', { pagetitle: 'ORHAN - User Profile' });
};

exports.ttw_Profile = (req, res) => {
  res.render('admin/profile', { layout: 'layout/admin', pagetitle: 'Dashboard - Profile' });
};

exports.updateUser = async (req, res) => {
  const { name, email, password, password_confirmation } = req.body;
  const errors = [];

  if (!name) errors.push('Name is required');
  if (!email) errors.push('Email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  if (password !== password_confirmation) errors.push('Passwords do not match');

  if (errors.length > 0) {
    return res.redirect('/dashboard/profile?error=' + encodeURIComponent(errors.join(', ')));
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.params.id, { name, email, password: hash });
    res.clearCookie('token');
    res.redirect('/orhan_admin?success=' + encodeURIComponent('Your Admin login credentials have been updated!'));
  } catch (err) {
    res.status(500).send(err.message);
  }
};
