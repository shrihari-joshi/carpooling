import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // Make sure this points to your API configuration

const Profile = () => {
    const [user, setUser] = useState(null);
    const [rides, setRides] = useState([]);
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState(''); // New state for time
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch user profile and rides
    const fetchProfileAndRides = async () => {
        try {
            // Fetch user profile
            const userResponse = await api.get('/auth/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setUser(userResponse.data);

            // Fetch available rides
            const ridesResponse = await api.get('/rides', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setRides(ridesResponse.data);
        } catch (error) {
            console.error('Error fetching profile and rides:', error);
        }
    };

    useEffect(() => {
        fetchProfileAndRides();
    }, []);

    const handleCreateRide = async (e) => {
        e.preventDefault();

        const combinedDateTime = new Date(`${date}T${time}`);

        const rideData = {
            startLocation,
            endLocation,
            date: combinedDateTime, // Send combined Date object
        };

        try {
            await api.post('/rides', rideData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setSuccessMessage('Ride created successfully!');
            setErrorMessage('');
            setStartLocation('');
            setEndLocation('');
            setDate('');
            setTime('');
            fetchProfileAndRides();
        } catch (error) {
            setErrorMessage('Error creating ride: ' + error.response?.data?.message || error.message);
            setSuccessMessage('');
        }
    };


    return (
        <div>
            <h2>Welcome, {user ? user.username : 'User  '}</h2>
            <h3>Create a New Ride</h3>
            <form onSubmit={handleCreateRide}>
                <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Start Location"
                    required
                />
                <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    placeholder="End Location"
                    required
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                />
                <button type="submit">Create Ride</button>
            </form>
            {successMessage && <p>{successMessage}</p>}
            {errorMessage && <p>{errorMessage}</p>}
            {rides.length > 0 ? (
                <>
                    <h3>Your Rides</h3>
                    <ul>
                        {rides.map((ride) => (
                            <li key={ride._id}>
                                <Link to={`/rides/${ride._id}`}>
                                    {ride.startLocation} to {ride.endLocation} on {new Date(ride.date).toLocaleDateString()}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (<p>No rides available</p>)}
        </div>
    );
};

export default Profile;