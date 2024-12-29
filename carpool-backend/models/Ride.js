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
});

module.exports = mongoose.model('Ride', rideSchema);