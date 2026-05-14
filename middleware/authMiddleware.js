const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authorization token required'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Authorization token required'
    });
  }

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedUser;

    next();
  } catch (err) {
    res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
};

const requireSameUser = (paramName = 'userId') => {
  return (req, res, next) => {
    const routeUserId = Number(req.params[paramName]);
    const authUserId = Number(req.user?.id);

    if (!Number.isInteger(routeUserId)) {
      return res.status(400).json({
        message: 'Valid user id is required'
      });
    }

    if (routeUserId !== authUserId) {
      return res.status(403).json({
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

module.exports = {
  requireAuth: requireAuth,
  requireSameUser: requireSameUser
};