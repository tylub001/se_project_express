const router = require("express").Router();
const { NOT_FOUND, MESSAGES } = require("../utils/errors");
const { createUser, login } = require("../controllers/users");
const { getClothingItems } = require('../controllers/clothingItems');
const auth = require("../middlewares/auth");

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");



router.post("/signup", createUser);
router.post("/signin", login);
router.get('/items', getClothingItems);

router.use(auth);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res) => {
  res.status(NOT_FOUND).json({ message: MESSAGES.NOT_FOUND });
});

module.exports = router;
