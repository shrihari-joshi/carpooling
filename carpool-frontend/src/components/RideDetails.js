import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import RideRouteMap from './RideRouteMap';
import PassengerInput from './JoinRide';

const RideDetails = () => {
    const { id } = useParams();
    const [ride, setRide] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');


    useEffect(() => {
        const fetchRideDetails = async () => {
            try {
                const response = await api.get(`/rides/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setRide(response.data);
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const passengerId = userResponse.data._id;

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
                setErrorMessage('The Ride is full, please choose another one!')
                return;
            }
            const updatedRide = {
                passengers: [...ride.passengers, passengerId],
            };
            console.log(updatedRide)
            await api.put(`/rides/${id}`, updatedRide, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccessMessage('Ride booked successfully!');
            setRide((prevRide) => ({
                ...prevRide,
                passengers: [...prevRide.passengers, passengerId], // Update local state
            }));
        } catch (error) {
            console.error('Error confirming ride:', error);
            setErrorMessage('Failed to book the ride. Please try again.');
        }
    };

    if (errorMessage) {
        return <div style={{ color: 'red' }}>{errorMessage}</div>;
    }

    if (!ride) {
        return <p>Loading ride details...</p>;
    }

    return (
        <div>
            <h2>Ride Details</h2>

            <p><strong>Ride ID:</strong> {ride._id}</p>
            <p><strong>Driver:</strong> {ride.driver.username} ({ride.driver.gender})</p>
            <p><strong>Driver Email:</strong> {ride.driver.email}</p>
            <p><strong>Driver Mobile:</strong> {ride.driver.driverMobile}</p>
            <p><strong>Start Location:</strong> {ride.startLocation}</p>
            <p><strong>End Location:</strong> {ride.endLocation}</p>
            <p><strong>Date:</strong> {new Date(ride.date).toLocaleString()}</p>

            <p><strong>Passengers:</strong> {ride.passengers.length > 0 ? ride.passengers
                .map(passenger => `${passenger.username} (${passenger.gender})`).join(', ')
                : 'No passengers'}</p>
            {/* auto reload */}
            <button onClick={handleConfirmRide}>Confirm Ride</button>
            <p><strong>Car Name:</strong> {ride.carName}</p>
            <p><strong>Car Number:</strong> {ride.carNumber}</p>
            <p><strong>Car Color:</strong> {ride.carColor}</p>
            <p><strong>Car Type:</strong> {ride.carCapacity}</p>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            <PassengerInput
                driverStart={ride.startLocation}
                driverEnd={ride.endLocation}
                onJoinRide={handleConfirmRide}
            />
            <RideRouteMap startLocation={ride.startLocation} endLocation={ride.endLocation} />

        </div>
    );
};

export default RideDetails;