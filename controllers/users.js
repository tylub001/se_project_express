const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  MESSAGES,
  CONFLICT,
  UNAUTHORIZED,
} = require("../utils/errors");

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(BAD_REQUEST).send({ message: MESSAGES.BAD_REQUEST });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
   .catch((err) => {
  if (err.message === 'Incorrect email or password') {
    return res.status(UNAUTHORIZED).send({ message: MESSAGES.UNAUTHORIZED });
  }

  return res.status(SERVER_ERROR).send({ message: MESSAGES.SERVER_ERROR });
});
};

const createUser = async (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return res.status(BAD_REQUEST).json({ message: MESSAGES.BAD_REQUEST });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(CONFLICT).json({ message: MESSAGES.EMAIL_CONFLICT });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, avatar, email, password: hash });

    const userToSend = user.toObject();
    delete userToSend.password;

    return res.status(201).json(userToSend);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(CONFLICT).json({ message: MESSAGES.EMAIL_CONFLICT });
    }
    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).json({ message: MESSAGES.BAD_REQUEST });
    }
    return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: MESSAGES.BAD_REQUEST });
      }
      return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
    });
};

const updateUserProfile = (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail()
    .then((updatedUser) => res.status(200).send(updatedUser))
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: MESSAGES.BAD_REQUEST });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
      }
      return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
