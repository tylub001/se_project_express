const ClothingItem = require("../models/clothingItem");
const { BAD_REQUEST, NOT_FOUND, SERVER_ERROR } = require("../utils/errors");

const getClothingItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      res.status(SERVER_ERROR).send({ message: err.message });
    });
};

const createClothingItem = (req, res, next) => {
  console.log(req.user._id);
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return next({ status: 400, message: err.message });
      }
      return next({ status: 500, message: "An error occurred on the server" });
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
        return res.status(NOT_FOUND).send({ message: err.message });
      } else if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      } else {
        return res.status(SERVER_ERROR).send({ message: err.message });
      }
    });
};

const updateClothingItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      res.status(SERVER_ERROR).send({ message: err.message });
    });
};

const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((deletedItem) => {
      res
        .status(200)
        .send({ message: "Item deleted successfully", deletedItem });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }

      res.status(SERVER_ERROR).send({ message: err.message });
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.status = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(200).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next({ status: BAD_REQUEST, message: "Invalid item ID format" });
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
      const error = new Error("Clothing item not found");
      error.status = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(200).json(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next({ status: BAD_REQUEST, message: "Invalid item ID format" });
      }
      return next(err);
    });
};

module.exports = {
  getClothingItems,
  createClothingItem,
  getClothingItem,
  deleteClothingItem,
  updateClothingItem,
  likeItem,
  dislikeItem,
};
