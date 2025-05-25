const User = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  MESSAGES,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).json(users))
    .catch((err) => {
      console.error(err);
      return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(201).json(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: MESSAGES.BAD_REQUEST });
      }
      return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: MESSAGES.NOT_FOUND });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: MESSAGES.BAD_REQUEST });
      }
      return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
    });
};

module.exports = { getUsers, createUser, getUser };
