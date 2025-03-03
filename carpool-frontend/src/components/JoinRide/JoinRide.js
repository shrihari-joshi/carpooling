import React, { useEffect, useState } from 'react';
import getCoordinates from '../GetCoordinates .js';
import RideRouteMap from '../RideRouteMap/RideRouteMap.js';
import api from '../../api';
import './JoinRide.css';

const JoinRide = ({ rideId, driverStart, driverEnd, onJoinRide }) => {
    const [passengerStart, setPassengerStart] = useState('');
    const [passengerEnd, setPassengerEnd] = useState('');
    const [passengerId, setPassengerId] = useState(null);
    const [ride, setRide] = useState(null);
    const [showMap, setShowMap] = useState(true);
    const [isDriver, setIsDriver] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch user profile to get passengerId
                const userResponse = await api.get('/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const fetchedPassengerId = userResponse.data._id;
                setPassengerId(fetchedPassengerId);

                // Fetch ride details
                const rideResponse = await api.get(`/rides/${rideId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setRide(rideResponse.data);

                // Check if the user is the driver
                if (rideResponse.data.driver._id === fetchedPassengerId) {
                    setIsDriver(true);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Failed to load ride details. Please try again.');
            }
        };

        fetchData();
    }, [rideId]);

    const handleStartChange = (event) => setPassengerStart(event.target.value);
    const handleEndChange = (event) => setPassengerEnd(event.target.value);

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat1 - lat2) * (Math.PI / 180);
        const dLon = (lon1 - lon2) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function canJoinRide(driverLat, driverLon, passengerLat, passengerLon) {
        return calculateDistance(driverLat, driverLon, passengerLat, passengerLon) <= 3;
    }

    const handleJoinRide = async () => {
        let passengerStartCoord = await getCoordinates(passengerStart);
        let driverStartCoord = await getCoordinates(driverStart);
        let passengerEndCoord = await getCoordinates(passengerEnd);
        let driverEndCoord = await getCoordinates(driverEnd);

        if (!passengerStartCoord || !driverStartCoord || !passengerEndCoord || !driverEndCoord) {
            alert('Failed to fetch location coordinates.');
            return;
        }

        if (canJoinRide(driverStartCoord.latitude, driverStartCoord.longitude,
            passengerStartCoord.latitude, passengerStartCoord.longitude) &&
            canJoinRide(driverEndCoord.latitude, driverEndCoord.longitude,
                passengerEndCoord.latitude, passengerEndCoord.longitude)) {
            onJoinRide();
            try {
                const token = localStorage.getItem('token');

                if (ride.passengers.some(passenger => passenger._id.toString() === passengerId.toString())) {
                    alert('User is already a passenger on this ride');
                    return;
                }

                if ((ride.carCapacity === 'hatchback' && ride.passengers.length >= 4) ||
                    (ride.carCapacity === 'sedan' && ride.passengers.length >= 4) ||
                    (ride.carCapacity === 'suv' && ride.passengers.length >= 7)) {
                    alert('The ride is full, please choose another one!');
                    return;
                }

                const response = await api.put(`/rides/join-ride/${rideId}`, {
                    passengerId,
                    startLocation: passengerStart,
                    endLocation: passengerEnd,
                }, { headers: { Authorization: `Bearer ${token}` } });

                if (response.status === 200) {
                    alert("You have successfully joined the ride!");
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error joining the ride:', error);
                alert('There was an error joining the ride.');
            }
        } else {
            alert("You are too far from the ride.");
        }
        setShowMap(false);
        setShowMap(true);
    };

    const handleCancelRide = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.put(`/rides/delete-passenger/${rideId}`, { passengerId }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                alert('Successfully removed from the ride.');
                window.location.reload();
            } else {
                alert('Failed to cancel the ride. Please try again.');
            }
        } catch (error) {
            console.error('Error cancelling the ride:', error);
            alert('There was an error cancelling the ride.');
        }
        setShowMap(false);
        setShowMap(true);
    };

    return (
        <div className="join-ride-container">
            {isDriver ? (
                // If user is the driver, only show the map
                <div className="join-ride-map">
                    <RideRouteMap startLocation={driverStart} endLocation={driverEnd} rideId={rideId} />
                </div>
            ) : (
                // If user is NOT the driver, show the form and buttons
                <>
                    <div className='join-ride-details'>
                        <input
                            type="text"
                            className="join-ride-input1"
                            placeholder="Your Start Location"
                            value={passengerStart}
                            onChange={handleStartChange}
                        />
                        <input
                            type="text"
                            className="join-ride-input2"
                            placeholder="Your End Location"
                            value={passengerEnd}
                            onChange={handleEndChange}
                        />
                    </div>
                    <div className="join-ride-buttons">
                        <button className="join-ride-button join-button" onClick={handleJoinRide}>Join Ride</button>
                        <button className="join-ride-button cancel-button" onClick={handleCancelRide}>Cancel Ride</button>
                    </div>
                    {showMap && (
                        <div className="join-ride-map">
                            <RideRouteMap startLocation={driverStart} endLocation={driverEnd} rideId={rideId} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JoinRide;
