const router = require("express").Router();
const { NOT_FOUND, MESSAGES } = require("../utils/errors");

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res) => {
  res.status(NOT_FOUND).json({ message: MESSAGES.NOT_FOUND });
});

module.exports = router;
