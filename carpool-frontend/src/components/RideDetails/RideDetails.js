import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import JoinRide from '../JoinRide/JoinRide.js';
import './RideDetails.css';

const RideDetails = () => {
    const { id } = useParams();
    const [ride, setRide] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    let passengerId;
    const [isDriver, setIsDriver] = useState(false);


    useEffect(() => {
        const fetchRideDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await api.get('/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userId = userResponse.data._id; // Logged-in user ID

                const rideResponse = await api.get(`/rides/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setRide(rideResponse.data);

                // Check if logged-in user is the driver
                if (rideResponse.data.driver._id === userId) {
                    setIsDriver(true);
                }
            } catch (error) {
                console.error('Error fetching ride details:', error);
                setErrorMessage('Failed to load ride details. Please try again.');
            }
        };

        fetchRideDetails();
    }, [id]);

    const handleConfirmRide = async () => {
        try {
            const token = localStorage.getItem('token');
            const userResponse = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            passengerId = userResponse.data._id;

            if (passengerId === ride.driver._id) {
                setErrorMessage('Driver cannot join as a passenger');
                return;
            }

            if (ride.passengers.some(passenger => passenger._id.toString() === passengerId.toString())) {
                setErrorMessage('User is already a passenger on this ride');
                return;
            }

            if ((ride.carCapacity === 'hatchback' && ride.passengers.length >= 4) ||
                (ride.carCapacity === 'sedan' && ride.passengers.length >= 4) ||
                (ride.carCapacity === 'suv' && ride.passengers.length >= 7)) {
                setErrorMessage('The Ride is full, please choose another one!');
                return;
            }

            const updatedRide = { passengers: [...ride.passengers, passengerId] };

            await api.put(`/rides/${id}`, updatedRide, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccessMessage('Ride booked successfully!');
            setRide((prevRide) => ({
                ...prevRide,
                passengers: [...prevRide.passengers, passengerId],
            }));
        } catch (error) {
            console.error('Error confirming ride:', error);
            setErrorMessage('Failed to book the ride. Please try again.');
        }
    };

    const handleCancelRide = async () => {
        try {
            const token = localStorage.getItem('token');
            const userResponse = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const passengerId = userResponse.data._id;
            console.log(ride.passengerCount)
            if (passengerId === ride.driver._id) {
                if (ride.passengerCount > 0) {
                    alert('Driver can not cancel the ride after passenger joins!');
                    return;
                }
            }

            if (passengerId !== ride.driver._id) {
                try {
                    const response = await api.put(`/rides/delete-passenger/${id}`, { passengerId }, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.status === 200) {
                        alert('Successfully removed from the ride.');
                    } else {
                        alert('Failed to cancel the ride. Please try again.');
                    }
                } catch (error) {
                    console.error('Error removing passenger from ride:', error);
                    setErrorMessage('Failed to cancel the ride. Please try again.');
                }
                return;
            }

            const response = await api.delete(`/rides/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                alert('Ride cancelled successfully');
                setSuccessMessage('Ride cancelled successfully');
                navigate('/profile');
            } else {
                setErrorMessage('Failed to cancel the ride. Please try again.');
            }
        } catch (error) {
            console.error('Error cancelling ride:', error);
            setErrorMessage('Failed to cancel the ride. Please try again.');
        }
    };

    if (errorMessage) {
        return <div className="error-message">{errorMessage}</div>;
    }

    if (!ride) {
        return <p className="loading-message">Loading ride details...</p>;
    }


    const handleGetDirections = () => {
        const seen = new Set();
        const waypointsArray = [];

        ride.passengerLocations.flatMap(loc => [loc.startLocation, loc.endLocation])
            .forEach(location => {
                if (!seen.has(location) && location !== ride.startLocation && location !== ride.endLocation) {
                    seen.add(location);
                    waypointsArray.push(location);
                }
            });

        const waypoints = waypointsArray.map(encodeURIComponent).join('|');

        console.log(waypoints);

        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.startLocation)}&destination=${encodeURIComponent(ride.endLocation)}&waypoints=${waypoints}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <div className='main-ride-detail'>
            <div className="ride-details-container">
                <div className="ride-left">
                    <div className='ride-left-header'>
                        <p className='ride-details-title'>Ride Details</p>
                    </div>
                    <div className="ride-info">
                        <div className="ride-column">
                            <p><strong>Ride ID:</strong> {ride._id}</p>
                            <p><strong>Driver:</strong> {ride.driver.username} ({ride.driver.gender})</p>
                            <p><strong>Email:</strong> {ride.driver.email}</p>
                            <p><strong>Mobile:</strong> {ride.driver.driverMobile}</p>
                        </div>
                        <div className="ride-column">
                            <p><strong>Start Location:</strong> {ride.startLocation}</p>
                            <p><strong>End Location:</strong> {ride.endLocation}</p>
                            <p><strong>Date:</strong> {new Date(ride.date).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="passengers-section">
                        <p><strong>Passengers:</strong> {ride.passengers.length > 0 ? ride.passengers
                            .map(passenger => `${passenger.username} (${passenger.gender})`).join(', ')
                            : 'No passengers'}</p>
                    </div>

                    <div className="buttons-section">
                        {isDriver && (
                            <div>
                                <button className="confirm-button-driver" onClick={handleConfirmRide}>Confirm Ride</button>
                                <button className="cancel-button-driver" onClick={handleCancelRide}>Cancel Ride</button>
                            </div>
                        )}
                        <button className='get-direc-button' onClick={handleGetDirections}> Get Directions</button>
                    </div>


                    <div className="car-details">
                        <p><strong>Car Name:</strong> {ride.carName}</p>
                        <p><strong>Car Number:</strong> {ride.carNumber}</p>
                        <p><strong>Car Color:</strong> {ride.carColor}</p>
                        <p><strong>Car Type:</strong> {ride.carCapacity}</p>
                    </div>
                </div>

                <div className="ride-map-container">
                    <JoinRide
                        rideId={ride._id}
                        driverStart={ride.startLocation}
                        driverEnd={ride.endLocation}
                        onJoinRide={handleConfirmRide}
                        passengerId={passengerId}
                    />

                </div>
            </div>
        </div>
    );
};

export default RideDetails;