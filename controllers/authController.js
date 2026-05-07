const jwt = require('jsonwebtoken');
const verifyUser = require('../config/passport');

exports.getLogin = (req, res) => {
  res.render('auth/login', { pagetitle: 'ORHAN - Admin Login' });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await verifyUser(email, password);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/dashboard');
  } catch (err) {
    res.redirect('/orhan_admin?error=' + encodeURIComponent(err.message));
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/orhan_admin?success=' + encodeURIComponent('You have been logged out'));
};
