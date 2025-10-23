const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/auth');
// Definisci la route per ottenere tutti gli eventi
router.post('/discover', eventController.getAllEvents);
router.get('/myevents', eventController.getMyEvents);
router.patch('/modify/:event_id', eventController.modifyEvent);
router.post('/add/newEvent', eventController.addNewEvent);
router.post(
	'/request/:event_id',
	authMiddleware.authMiddleware,
	eventController.modifyResponseEvent
);
router.get('/:event_id', eventController.getSpecificEvent);

module.exports = router;
