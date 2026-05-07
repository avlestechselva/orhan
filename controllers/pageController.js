const News = require('../models/News');
const Gallery = require('../models/Gallery');
const GalleryImage = require('../models/GalleryImage');
const Resource = require('../models/Resource');
const Video = require('../models/Video');

const paginate = (query, page, limit) => {
  const skip = (page - 1) * limit;
  return { query: query.skip(skip).limit(limit), skip, limit };
};

exports.index = (req, res) => {
  res.render('pages/index', { pagetitle: 'ORHAN', charityLink: process.env.CHARITY_LINK });
};

exports.about = (req, res) => {
  res.render('pages/about', { pagetitle: 'ORHAN - Meet the team' });
};

exports.news = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const total = await News.countDocuments();
    const news = await News.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const totalPages = Math.ceil(total / limit);
    res.render('pages/news', {
      pagetitle: 'ORHAN - News',
      news,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.showNews = async (req, res) => {
  try {
    const news = await News.findOne({ title: req.params.title });
    if (!news) return res.status(404).send('News not found');
    res.render('pages/shownews', { pagetitle: 'ORHAN - News', news });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.portfolio = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const total = await Gallery.countDocuments();
    const galleries = await Gallery.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const totalPages = Math.ceil(total / limit);
    res.render('pages/portfolio', {
      pagetitle: 'ORHAN - Portfolio',
      galleries,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.gallery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const total = await Gallery.countDocuments();
    const galleries = await Gallery.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const totalPages = Math.ceil(total / limit);
    res.render('pages/gallery', {
      pagetitle: 'ORHAN - Galleries',
      galleries,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.showGallery = async (req, res) => {
  try {
    const name = req.params.name.trim();
    const galleryInfo = await Gallery.findOne({ name });
    if (!galleryInfo) return res.status(404).send('Gallery not found');

    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const total = await GalleryImage.countDocuments({ gallery_id: galleryInfo._id });
    const images = await GalleryImage.find({ gallery_id: galleryInfo._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalPages = Math.ceil(total / limit);

    res.render('pages/showgallery', {
      pagetitle: `ORHAN - ${name} Gallery Images`,
      gallery: galleryInfo,
      images,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.resources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.render('pages/resources', { pagetitle: 'ORHAN - Resources', resources });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.videos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const total = await Video.countDocuments();
    const videos = await Video.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const totalPages = Math.ceil(total / limit);
    res.render('pages/videos', {
      pagetitle: 'ORHAN - Videos',
      videos,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.contact = (req, res) => {
  res.render('pages/contact', { pagetitle: 'ORHAN - Contact' });
};

exports.bcontact = (req, res) => {
  res.render('pages/bcontact', { pagetitle: 'ORHAN - Bank Contact' });
};

exports.contribution = (req, res) => {
  res.render('pages/contribution', { pagetitle: 'ORHAN - Contribution' });
};

exports.trustees = (req, res) => {
  res.render('pages/trustees', { pagetitle: 'ORHAN - Trustees' });
};

exports.privacy = (req, res) => {
  res.render('pages/privacy', { pagetitle: 'ORHAN - Privacy Policy' });
};
