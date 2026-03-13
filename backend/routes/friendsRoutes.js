const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware.authMiddleware);

// Definisci la route per ottenere tutti gli eventi
router.get("/:user_id", friendsController.getAllFriends);
router.get("/query/:query", friendsController.GetFriendsByQuery);
router.get("/:user_id/accepted", friendsController.GetFriends);
router.get("/:user_id/pendingFriends", friendsController.getPendingFriends);
router.post("/request", friendsController.sendFriendRequest);
// router.patch("/:user_id/accept", friendsController.acceptFriendRequest);
router.delete("/delete", friendsController.deleteFriend);

module.exports = router;
