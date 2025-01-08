const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
    driverName: { type: String },
    driverMobile: { type: String },
    passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User ' }],
    passengerCount: { type: Number, default: 0 },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    date: { type: Date, required: true },
    carName: { type: String, required: true },
    carNumber: { type: String, required: true },
    carColor: { type: String, required: true },
    carCapacity: { type: String, required: true },
    passengerLocations: [
        {
            passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            startLocation: { type: String, required: true },
            endLocation: { type: String, required: true },
        }
    ],

});

module.exports = mongoose.model('Ride', rideSchema);