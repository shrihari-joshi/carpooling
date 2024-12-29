import React, { useState } from 'react';
import LeafletMap from './LeafletMap';
import api from '../../api'; // Adjust the import based on your API configuration

const CreateRide = () => {
    const [route, setRoute] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleRouteSelected = (selectedRoute) => {
        setRoute(selectedRoute);
    };

    const handleCreateRide = async () => {
        if (!route) {
            setErrorMessage('Please select a route on the map.');
            return;
        }

        const rideData = {
            startLocation: route.legs[0].start_address,
            endLocation: route.legs[0].end_address,
            date: new Date(), // Set the date as needed
            // Add other ride details as necessary
        };

        try {
            await api.post('/rides', rideData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setSuccessMessage('Ride created successfully!');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Error creating ride: ' + (error.response?.data?.message || error.message));
            setSuccessMessage('');
        }
    };

    return (
        <div>
            <h2>Create a New Ride</h2>
            <LeafletMap onRouteSelected={handleRouteSelected} />
            <button onClick={handleCreateRide}>Create Ride</button>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default CreateRide;