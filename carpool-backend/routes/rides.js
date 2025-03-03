const express = require('express');
const Ride = require('../models/Ride');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new ride
router.post('/', authMiddleware, async (req, res) => {
    const { startLocation, endLocation, date, carName, carNumber, carColor, carCapacity } = req.body;

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
            carName,
            carNumber,
            carColor,
            carCapacity,
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
        const ride = await Ride.findById(req.params.id)
            .populate('driver', 'username email driverMobile passengers gender')
            .populate('passengers', 'username gender');//here
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


router.put('/join-ride/:id', authMiddleware, async (req, res) => {
    const { id: rideId } = req.params;

    const { startLocation, endLocation } = req.body;

    try {
        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        ride.passengerLocations.push({
            passenger: req.user.id,
            startLocation: startLocation || ride.startLocation,
            endLocation: endLocation || ride.endLocation,
        });

        await ride.save();
        res.status(200).json({ message: 'Joined the ride successfully' });
    } catch (error) {
        console.error('Error joining ride:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

//cancel a ride by driver
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id: rideId } = req.params;

    try {
        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the ride has any passengers
        if (ride.passengers.length > 0) {
            return res.status(400).json({ message: 'Cannot cancel a ride with passengers' });
        }

        await Ride.findByIdAndDelete(rideId);
        res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//cancel a ride by passenger
router.put('/delete-passenger/:id', authMiddleware, async (req, res) => {
    const { passengerId } = req.body;

    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Check if the user is a passenger in this ride
        if (!ride.passengers.includes(passengerId)) {
            return res.status(400).json({ message: 'User is not a passenger in this ride' });
        }

        // Remove the passenger from the passengers array
        ride.passengers = ride.passengers.filter(
            (id) => id.toString() !== passengerId.toString()
        );

        ride.passengerCount = ride.passengers.length; // Update passenger count

        await ride.save();
        res.status(200).json({ message: 'Passenger removed from the ride successfully' });
    } catch (error) {
        console.error('Error removing passenger from the ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
});






module.exports = router;