const router = require("express").Router();
const { updateUserProfile, getCurrentUser } = require("../controllers/users")


router.get("/me", getCurrentUser);
router.patch('/me', updateUserProfile);

module.exports = router;
