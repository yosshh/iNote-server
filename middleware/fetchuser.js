const jwt = require('jsonwebtoken');

const JWT_SECRET = 'yashaccha$hai';

const fetchuser = async (req, res, next) => {
  try {
    const token = req.header('auth-token');
    if (!token) {
      return res.status(401).json({ error: 'Please authenticate using a valid token.' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ error: 'Please authenticate using a correct token.' });
  }
};

module.exports = fetchuser;
