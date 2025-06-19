const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
  MESSAGES,
} = require("../utils/errors");

const getClothingItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
    });
};

const createClothingItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return next({ status: BAD_REQUEST, message: MESSAGES.BAD_REQUEST });
      }
      return next({ status: SERVER_ERROR, message: MESSAGES.SERVER_ERROR });
    });
};

const getClothingItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => res.status(200).send(item))
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

const deleteClothingItem = (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== userId) {
        return res.status(FORBIDDEN).json({ message: MESSAGES.FORBIDDEN });
      }

      return item.deleteOne().then(() =>
        res.status(200).json({ message: 'Item deleted successfully', deletedItem: item })
      );
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: MESSAGES.ITEM_NOT_FOUND });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: MESSAGES.BAD_REQUEST });
      }
      return res.status(SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error(MESSAGES.ITEM_NOT_FOUND);
      error.status = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(200).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next({ status: BAD_REQUEST, message: MESSAGES.BAD_REQUEST });
      }
      return next(err);
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error(MESSAGES.ITEM_NOT_FOUND);
      error.status = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(200).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next({ status: BAD_REQUEST, message: MESSAGES.BAD_REQUEST });
      }
      return next(err);
    });
};

module.exports = {
  getClothingItems,
  createClothingItem,
  getClothingItem,
  deleteClothingItem,
  likeItem,
  dislikeItem,
};
