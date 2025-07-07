const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { MESSAGES } = require('../utils/errors');
const UnauthorizedError = require("../utils/UnathorizedError");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError(MESSAGES.UNAUTHORIZED));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError(MESSAGES.UNAUTHORIZED));
  }
};
