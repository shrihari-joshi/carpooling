const Ride = require('../models/Ride');

exports.createRide = async (req, res) => {
    const { startLocation, endLocation, date, carName, carNumber, carColor, carCapacity } = req.body;

    if (!startLocation || !endLocation || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newRide = new Ride({
            driver: req.user.id,
            driverName: req.user.username,
            driverMobile: req.user.mobile,
            startLocation,
            endLocation,
            date,
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
};

exports.getAllRides = async (req, res) => {
    try {
        const rides = await Ride.find().populate('driver', 'username');
        res.json(rides);
    } catch (error) {
        console.error('Error fetching rides:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRideById = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('driver', 'username email driverMobile passengers gender')
            .populate('passengers', 'username gender');
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }
        res.json(ride);
    } catch (error) {
        console.error('Error fetching ride details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.togglePassenger = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.driver.toString() === req.user.id) {
            return res.status(400).json({ message: 'Driver cannot join as a passenger' });
        }

        const isPassenger = ride.passengers.includes(req.user.id);

        if (isPassenger) {
            ride.passengers = ride.passengers.filter(id => id.toString() !== req.user.id);
        } else {
            ride.passengers.push(req.user.id);
        }

        ride.passengerCount = ride.passengers.length;

        await ride.save();
        res.status(200).json(ride);
    } catch (error) {
        console.error('Error updating ride:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.joinRide = async (req, res) => {
    const { startLocation, endLocation } = req.body;

    try {
        const ride = await Ride.findById(req.params.id);
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
};

exports.cancelRideByDriver = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.passengers.length > 0) {
            return res.status(400).json({ message: 'Cannot cancel a ride with passengers' });
        }

        await Ride.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.cancelRideByPassenger = async (req, res) => {
    const { passengerId } = req.body;

    try {
        const ride = await Ride.findById(req.params.id);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (!ride.passengers.includes(passengerId)) {
            return res.status(400).json({ message: 'User is not a passenger in this ride' });
        }

        ride.passengers = ride.passengers.filter(
            id => id.toString() !== passengerId.toString()
        );
        ride.passengerLocations = ride.passengerLocations.filter(
            loc => loc.passenger.toString() !== passengerId.toString()
        );
        ride.passengerCount = ride.passengers.length;

        await ride.save();
        res.status(200).json({ message: 'Passenger removed from the ride successfully' });
    } catch (error) {
        console.error('Error removing passenger from the ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
