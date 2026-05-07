const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const pageController = require('../controllers/pageController');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const newsController = require('../controllers/newsController');
const galleryController = require('../controllers/galleryController');
const galleryImageController = require('../controllers/galleryImageController');
const resourceController = require('../controllers/resourceController');
const videoController = require('../controllers/videoController');

// Temporary debug route — remove after confirming DB works
const News = require('../models/News');
const Gallery = require('../models/Gallery');
router.get('/debug-db', async (req, res) => {
  try {
    const newsCount = await News.countDocuments();
    const galleryCount = await Gallery.countDocuments();
    res.json({ connected: true, newsCount, galleryCount });
  } catch (e) {
    res.json({ connected: false, error: e.message });
  }
});

// Public routes
router.get('/', pageController.index);
router.get('/About', pageController.about);
router.get('/News', pageController.news);
router.get('/News/tags/:name', pageController.news);
router.get('/News/:title', pageController.showNews);
router.get('/Portfolio', pageController.portfolio);
router.get('/Gallery', pageController.gallery);
router.get('/Gallery/:name', pageController.showGallery);
router.get('/Resource', pageController.resources);
router.get('/Videos', pageController.videos);
router.get('/Contribution', pageController.contribution);
router.get('/Trustees', pageController.trustees);
router.get('/Privacy-Policy', pageController.privacy);
router.get('/Contact', pageController.contact);
router.get('/Bank-Contact', pageController.bcontact);

// Auth routes
router.get('/orhan_admin', ensureGuest, authController.getLogin);
router.post('/orhan_admin', authController.postLogin);
router.post('/logout', authController.logout);

// Protected - Dashboard
router.get('/dashboard', ensureAuth, dashboardController.index);
router.get('/Profile', ensureAuth, dashboardController.profile);
router.get('/dashboard/profile', ensureAuth, dashboardController.ttw_Profile);
router.put('/dashboard/profile/:id', ensureAuth, dashboardController.updateUser);
router.put('/profile/:id', ensureAuth, dashboardController.updateUser);

// Protected - News CRUD
router.get('/newsSection', ensureAuth, newsController.index);
router.get('/newsSection/create', ensureAuth, newsController.create);
router.post('/newsSection', ensureAuth, newsController.store);
router.get('/newsSection/:id/edit', ensureAuth, newsController.edit);
router.put('/newsSection/:id', ensureAuth, newsController.update);
router.delete('/newsSection/:id', ensureAuth, newsController.destroy);

// Protected - Gallery CRUD
router.get('/gallerySection', ensureAuth, galleryController.index);
router.get('/gallerySection/create', ensureAuth, galleryController.create);
router.post('/gallerySection', ensureAuth, galleryController.store);
router.get('/gallerySection/:id/edit', ensureAuth, galleryController.edit);
router.put('/gallerySection/:id', ensureAuth, galleryController.update);
router.delete('/gallerySection/:id', ensureAuth, galleryController.destroy);

// Protected - Gallery Images CRUD
router.get('/galleryImageSection', ensureAuth, galleryImageController.index);
router.get('/galleryImageSection/create', ensureAuth, galleryImageController.create);
router.post('/galleryImageSection', ensureAuth, galleryImageController.store);
router.get('/galleryImageSection/:id/edit', ensureAuth, galleryImageController.edit);
router.put('/galleryImageSection/:id', ensureAuth, galleryImageController.update);
router.delete('/galleryImageSection/:id', ensureAuth, galleryImageController.destroy);

// Protected - Resource CRUD
router.get('/resourceSection', ensureAuth, resourceController.index);
router.get('/resourceSection/create', ensureAuth, resourceController.create);
router.post('/resourceSection', ensureAuth, resourceController.store);
router.get('/resourceSection/:id/edit', ensureAuth, resourceController.edit);
router.put('/resourceSection/:id', ensureAuth, resourceController.update);
router.delete('/resourceSection/:id', ensureAuth, resourceController.destroy);

// Protected - Video CRUD
router.get('/videoSection', ensureAuth, videoController.index);
router.get('/videoSection/create', ensureAuth, videoController.create);
router.post('/videoSection', ensureAuth, videoController.store);
router.get('/videoSection/:id/edit', ensureAuth, videoController.edit);
router.put('/videoSection/:id', ensureAuth, videoController.update);
router.delete('/videoSection/:id', ensureAuth, videoController.destroy);

module.exports = router;
