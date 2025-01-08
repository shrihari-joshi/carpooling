import React, { useState } from 'react';
import getCoordinates from './GetCoordinates ';
import RideRouteMap from './RideRouteMap';

const JoinRide = ({ driverStart, driverEnd, onJoinRide }) => {
    const [passengerStart, setPassengerStart] = useState('');
    const [passengerEnd, setPassengerEnd] = useState('');
    const [passengerLocations, setPassengerLocations] = useState([]);


    const handleStartChange = (event) => {
        setPassengerStart(event.target.value);
    };

    const handleEndChange = (event) => {
        setPassengerEnd(event.target.value);
    };
    // Function to calculate distance between two coordinates
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat1 - lat2) * (Math.PI / 180);
        const dLon = (lon1 - lon2) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance;
    }

    function canJoinRide(driverLat, driverLon, passengerLat, passengerLon) {
        const distanceToStart = calculateDistance(driverLat, driverLon, passengerLat, passengerLon);
        console.log(distanceToStart)
        return distanceToStart <= 3; // Check if within 2 kilometers
    }

    const handleJoinRide = async () => {
        //passenger start
        let passengerStartLat, passengerStartLon;
        const passengerStartCoord = await getCoordinates(passengerStart);
        if (passengerStartCoord) {
            passengerStartLat = passengerStartCoord.latitude;
            passengerStartLon = passengerStartCoord.longitude;
            console.log(`Passanger Start: Latitude: ${passengerStartLat}, Longitude: ${passengerStartLon}`);
        } else {
            console.error('Failed to fetch coordinates.');
        }

        //driver start
        let driverStartLat, driverStartLon
        const driverStartCoord = await getCoordinates(driverStart);
        if (driverStartCoord) {
            driverStartLat = driverStartCoord.latitude;
            driverStartLon = driverStartCoord.longitude;
            console.log(`Driver Start: Latitude: ${driverStartLat}, Longitude: ${driverStartLon}`);
        } else {
            console.error('Failed to fetch coordinates.');
        }

        //passenger end
        let passengerEndLat, passengerEndLon
        const passengerEndCoord = await getCoordinates(passengerEnd);
        if (passengerEndCoord) {
            passengerEndLat = passengerEndCoord.latitude;
            passengerEndLon = passengerEndCoord.longitude;
            console.log(`Passanger End: Latitude: ${passengerEndLat}, Longitude: ${passengerEndLon}`);
        } else {
            console.error('Failed to fetch coordinates.');
        }
        //driver end
        let driverEndLat, driverEndLon;
        const driverEndCoord = await getCoordinates(driverEnd);
        if (driverEndCoord) {
            driverEndLat = driverEndCoord.latitude;
            driverEndLon = driverEndCoord.longitude;
            console.log(`Driver End: Latitude: ${driverEndLat}, Longitude: ${driverEndLon}`);
        } else {
            console.error('Failed to fetch coordinates.');
        }

        if (canJoinRide(driverStartLat, driverStartLon, passengerStartLat, passengerStartLon) &&
            canJoinRide(driverEndLat, driverEndLon, passengerEndLat, passengerEndLon)) {
            onJoinRide();
            setPassengerLocations([...passengerLocations, { startLocation: passengerStart, endLocation: passengerEnd }]);
            alert("You can join the ride.");
        } else {
            alert("You are too far from the ride.");
        }


    };

    return (
        <div>
            <input
                type="text"
                placeholder="Your Start Location"
                value={passengerStart}
                onChange={handleStartChange}
            />
            <input
                type="text"
                placeholder="Your End Location"
                value={passengerEnd}
                onChange={handleEndChange}
            />
            <button onClick={handleJoinRide}>Join Ride</button>

            <RideRouteMap
                startLocation={driverStart}
                endLocation={driverEnd}
                passengerLocations={passengerLocations}
            />
        </div>
    );
};

export default JoinRide;