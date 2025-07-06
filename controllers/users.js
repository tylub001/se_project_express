const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} = require("../utils/custom-errors");

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
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
        return next(new UnauthorizedError(err.message));
      }
      return next(err);
    });
};

const createUser = async (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError("A user with this email already exists"));
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, avatar, email, password: hash });

    const userToSend = user.toObject();
    delete userToSend.password;

   return res.status(201).json(userToSend);
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError("A user with this email already exists"));
    }
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid input data"));
    }
    return next(err);
  }
};
const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => new NotFoundError("User not found"))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid user ID format"));
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
    .orFail(() => new NotFoundError("User not found"))
    .then((updatedUser) => res.status(200).send(updatedUser))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid input data"));
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