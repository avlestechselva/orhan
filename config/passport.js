const bcrypt = require('bcryptjs');
const User = require('../models/User');

const verifyUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('No user found with that email');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Incorrect password');
  return user;
};

module.exports = verifyUser;
