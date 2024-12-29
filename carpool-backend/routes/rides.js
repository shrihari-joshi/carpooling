const express = require('express');
const Ride = require('../models/Ride');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new ride
router.post('/', authMiddleware, async (req, res) => {
    const { startLocation, endLocation, date } = req.body;

    // Validate request body
    if (!startLocation || !endLocation || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new ride with driver details from authenticated user
        const newRide = new Ride({
            driver: req.user.id,
            driverName: req.user.username,
            driverMobile: req.user.mobile,
            startLocation,
            endLocation,
            date, // This now includes time
        });


        const savedRide = await newRide.save();
        res.status(201).json(savedRide);
    } catch (error) {
        console.error('Error creating ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all rides
router.get('/', async (req, res) => {
    try {
        const rides = await Ride.find().populate('driver', 'username');
        res.json(rides);
    } catch (error) {
        console.error('Error fetching rides:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get ride details by ID
router.get('/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id).populate('driver', 'username email driverMobile passengers');
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }
        res.json(ride);
    } catch (error) {
        console.error('Error fetching ride details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update ride to add a passenger
router.put('/:id', authMiddleware, async (req, res) => {
    console.log(req.body)
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the current user is the driver
        if (ride.driver.toString() === req.user.id) {
            return res.status(400).json({ message: 'Driver cannot join as a passenger' });
        }

        const isPassenger = ride.passengers.includes(req.user.id);

        if (isPassenger) {
            // Remove user from passengers list if already a passenger
            ride.passengers = ride.passengers.filter((passengerId) => passengerId.toString() !== req.user.id);
            ride.passengerCount = ride.passengers.length; // Update passenger count
        } else {
            // Add user to passengers list
            ride.passengers.push(req.user.id);
            ride.passengerCount = ride.passengers.length; // Update passenger count
        }

        await ride.save();
        res.status(200).json(ride);
    } catch (error) {
        console.error('Error updating ride:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;