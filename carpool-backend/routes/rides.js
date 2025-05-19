const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const rideController = require('../controllers/rideController');

router.post('/', authMiddleware, rideController.createRide);
router.get('/', rideController.getAllRides);
router.get('/:id', rideController.getRideById);
router.put('/:id', authMiddleware, rideController.togglePassenger);
router.put('/join-ride/:id', authMiddleware, rideController.joinRide);
router.delete('/delete/:id', authMiddleware, rideController.cancelRideByDriver);
router.put('/delete-passenger/:id', authMiddleware, rideController.cancelRideByPassenger);

module.exports = router;
