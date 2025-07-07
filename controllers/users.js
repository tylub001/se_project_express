const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const BadRequestError = require("../utils/BadRequestError");
const NotFoundError = require("../utils/NotFoundError");
const ConflictError = require("../utils/ConflictError")
const UnauthorizedError = require("../utils/UnathorizedError")
const { MESSAGES } = require("../utils/errors");

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError(MESSAGES.BAD_REQUEST));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return next(new UnauthorizedError(MESSAGES.UNAUTHORIZED));
      }
      return next(err);
    });
};

const createUser = async (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError(MESSAGES.BAD_REQUEST));
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError(MESSAGES.CONFLICT));
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, avatar, email, password: hash });

    const userToSend = user.toObject();
    delete userToSend.password;

   return res.status(201).json(userToSend);
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError(MESSAGES.CONFLICT));
    }
    if (err.name === "ValidationError") {
      return next(new BadRequestError(MESSAGES.BAD_REQUEST));
    }
    return next(err);
  }
};
const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => new NotFoundError(MESSAGES.NOT_FOUND))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError(MESSAGES.BAD_REQUEST));
      }
      return next(err);
    });
};

const updateUserProfile = (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => new NotFoundError(MESSAGES.NOT_FOUND))
    .then((updatedUser) => res.status(200).send(updatedUser))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError(MESSAGES.BAD_REQUEST));
      }
      return next(err);
    });
};
module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};