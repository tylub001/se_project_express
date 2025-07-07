const router = require("express").Router();
const { MESSAGES } = require("../utils/errors");
const NotFoundError = require('../utils/NotFoundError');
const { createUser, login } = require("../controllers/users");
const { getClothingItems } = require('../controllers/clothingItems');
const auth = require("../middlewares/auth");
const {
  validateUserBody,
  validateAuth,
} = require('../middlewares/validator');

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");



router.post("/signup", validateUserBody, createUser);
router.post("/signin", validateAuth, login);
router.get('/items', getClothingItems);

router.use(auth);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res, next) => next(new NotFoundError(MESSAGES.NOT_FOUND)));
module.exports = router;
