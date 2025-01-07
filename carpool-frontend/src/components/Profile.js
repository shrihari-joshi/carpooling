import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import RideRouteMap from './RideRouteMap';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [rides, setRides] = useState([]);
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [carName, setCarName] = useState('');
    const [carNumber, setCarNumber] = useState('');
    const [carColor, setCarColor] = useState('');
    const [carCapacity, setCarCapacity] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Function to get the current time in HH:MM format
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };
    const getMinTime = () => {
        const selectedDate = new Date(date);
        const today = new Date();

        if (selectedDate.toDateString() === today.toDateString()) {
            return getCurrentTime();
        }
        return '00:00';
    };
    useEffect(() => {
        setDate(getTodayDate());
        setTime(getCurrentTime());
    }, []);

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
            const now = new Date();
            const availableRides = ridesResponse.data.filter(ride => new Date(ride.date) >= now);
            setRides(availableRides);

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
            carName,
            carNumber,
            carColor,
            carCapacity,
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
            setCarName('');
            setCarNumber('');
            setCarColor('');
            setCarCapacity('');
            fetchProfileAndRides();
        } catch (error) {
            setErrorMessage('Error creating ride: ' + error.response?.data?.message || error.message);
            setSuccessMessage('');
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            localStorage.removeItem('token'); // Remove the token from local storage
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };



    return (
        <div>
            <h2>Welcome, {user ? user.username : 'User  '}</h2>
            <button onClick={handleLogout}>Logout</button>
            <h3>Create a New Ride</h3>
            <form onSubmit={handleCreateRide} >
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
                    min={new Date().toISOString().split("T")[0]}
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    min={getMinTime()}
                />
                <input
                    type="text"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    placeholder="Car Name"
                    required
                />
                <input
                    type="text"
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="Car Number"
                    required
                />
                <input
                    type="text"
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    placeholder="Car Color"
                />
                <select
                    id="carType"
                    value={carCapacity}
                    onChange={(e) => setCarCapacity(e.target.value)}
                    required
                >
                    <option value="" disabled>Select Car Type</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                </select>
                <button type="submit">Create Ride</button>
            </form>


            <RideRouteMap startLocation={startLocation} endLocation={endLocation} />
            {successMessage && <p>{successMessage}</p>}
            {errorMessage && <p>{errorMessage}</p>}
            {rides.length > 0 ? (
                <>
                    <h3>Your Rides</h3>
                    <ul>
                        {rides.map((ride) => (
                            <li key={ride._id} style={{ color: "whitesmoke" }}>
                                <Link to={`/rides/${ride._id}`} style={{ color: "whitesmoke" }}>
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