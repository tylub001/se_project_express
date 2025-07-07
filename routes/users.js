const router = require("express").Router();
const { updateUserProfile, getCurrentUser } = require("../controllers/users");
const { validateUserUpdate } = require("../middlewares/validator");

router.get("/me", getCurrentUser);
router.patch("/me", validateUserUpdate, updateUserProfile);

module.exports = router;
