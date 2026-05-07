exports.ensureAuth = (req, res, next) => {
  if (req.user) return next();
  res.redirect('/orhan_admin?error=' + encodeURIComponent('Please log in to access this page'));
};

exports.ensureGuest = (req, res, next) => {
  if (!req.user) return next();
  res.redirect('/dashboard');
};
