const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/auth");
router.get("/:userHandle", profileController.getData);
router.delete(
  "/guest/removeall",
  authMiddleware.authMiddleware,
  profileController.deleteGuest,
);
router.post(
  "/guest/add",
  authMiddleware.authMiddleware,
  profileController.addGuest,
);

module.exports = router;
