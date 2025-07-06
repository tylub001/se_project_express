const ClothingItem = require("../models/clothingItem");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/custom-errors");
const { MESSAGES } = require("../utils/errors");

const getClothingItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return next(err);
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
        return next(new BadRequestError(MESSAGES.BAD_REQUEST));
      }
      return next(err);
    });
};

const getClothingItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail(() => new NotFoundError(MESSAGES.ITEM_NOT_FOUND))
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError(MESSAGES.BAD_REQUEST));
      }
      return next(err);
    });
};

const deleteClothingItem = (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  return ClothingItem.findById(itemId)
    .orFail(() => new NotFoundError(MESSAGES.ITEM_NOT_FOUND))
    .then((item) => {
      if (item.owner.toString() !== userId) {
        return next(new ForbiddenError(MESSAGES.FORBIDDEN));
      }

      return item
        .deleteOne()
        .then(() =>
          res
            .status(200)
            .json({ message: "Item deleted successfully", deletedItem: item })
        );
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError(MESSAGES.BAD_REQUEST));
      }
      return next(err);
    });
};
const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError(MESSAGES.ITEM_NOT_FOUND))
    .then((item) => res.status(200).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError(MESSAGES.BAD_REQUEST));
      }
      return next(err);
    });
};

const dislikeItem = (req, res, next) => ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError(MESSAGES.ITEM_NOT_FOUND))
    .then((item) => res.status(200).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError(MESSAGES.BAD_REQUEST));
      }
      return next(err);
    });
module.exports = {
  getClothingItems,
  createClothingItem,
  getClothingItem,
  deleteClothingItem,
  likeItem,
  dislikeItem,
};
