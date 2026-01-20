const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
// Definisci la route per ottenere tutti gli eventi
router.get("/", groupController.getAllGroups);
router.get("/:group_id", groupController.getSpecificGroup);
router.get("/:group_id/group-events", groupController.getGroupEvents);
router.get("/groupEvents/:event_id", groupController.getSpecificGroupEvent);
router.post("/add/newGroup", groupController.addNewGroup);
router.patch("/modify/:group_id", groupController.modifyGroup);
router.patch("/add/participants/:group_id", groupController.addParticipants);
router.patch(
  "/remove/participants/:group_id",
  groupController.removeParticipant,
);
router.patch(
  "/modify/participants/:group_id",
  groupController.modifyParticipant,
);
router.delete("/leave/:group_id", groupController.leaveGroup);

module.exports = router;
