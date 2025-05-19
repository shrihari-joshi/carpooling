import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import RideRouteMap from '../RideRouteMap/RideRouteMap.js';
import './Profile.css'; // Import the new CSS file

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

    useEffect(() => {
        setDate(getTodayDate());
        setTime(getCurrentTime());
        fetchProfileAndRides();
    }, []);

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    };

    const getMinTime = () => {
        const selectedDate = new Date(date);
        return selectedDate.toDateString() === new Date().toDateString() ? getCurrentTime() : '00:00';
    };

    const fetchProfileAndRides = async () => {
        try {
            const userResponse = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setUser(userResponse.data);

            const ridesResponse = await api.get('/rides', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            setRides(ridesResponse.data.filter(ride => new Date(ride.date) >= new Date()));
        } catch (error) {
            console.error('Error fetching profile and rides:', error);
        }
    };

    const handleCreateRide = async (e) => {
        e.preventDefault();
        console.log('hey there')
        const rideData = {
            startLocation,
            endLocation,
            date: new Date(`${date}T${time}`),
            carName,
            carNumber,
            carColor,
            carCapacity,
        };

        try {
            await api.post('/rides', rideData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setSuccessMessage('Ride created successfully!');
            setErrorMessage('');
            setStartLocation('');
            setEndLocation('');
            setCarName('');
            setCarNumber('');
            setCarColor('');
            setCarCapacity('');
            fetchProfileAndRides();
        } catch (error) {
            setErrorMessage('Error creating ride: ' + (error.response?.data?.message || error.message));
            setSuccessMessage('');
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            localStorage.removeItem('token');
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="profile-container">
            {/* Left Side - Form */}
            <div className="profile-left">
                {/* Header with Title & Create Ride Button */}
                <div className="form-header">
                    <h3 className="ride-heading">Create a New Ride</h3>
                </div>

                {/* Ride Form */}
                <form className="ride-form" onSubmit={handleCreateRide}>
                    {/* First Row: Start & End Location */}
                    <input type="text" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} placeholder="Start Location" required />
                    <input type="text" value={endLocation} onChange={(e) => setEndLocation(e.target.value)} placeholder="End Location" required />

                    {/* Second Row: Date & Time */}
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

                    {/* Third Row: Car Name & Car Number */}
                    <input type="text" value={carName} onChange={(e) => setCarName(e.target.value)} placeholder="Car Name" required />
                    <input type="text" value={carNumber} onChange={(e) => setCarNumber(e.target.value)} placeholder="Car Number" required />

                    {/* Fourth Row: Car Color & Car Type */}
                    <input type="text" value={carColor} onChange={(e) => setCarColor(e.target.value)} placeholder="Car Color" />
                    <select value={carCapacity} onChange={(e) => setCarCapacity(e.target.value)} required>
                        <option value="" disabled>Select Car Type</option>
                        <option value="hatchback">Hatchback</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                    </select>


                    <div>
                        <button type="submit" className="submit-button">Create Ride</button>
                    </div>
                </form>
            </div>


            {/* Right Side - Map and Rides */}
            <div className="profile-right">
                <div className="map-container">
                    <RideRouteMap startLocation={startLocation} endLocation={endLocation} />
                </div>

                <div className="rides-section">
                    <h3 className="rides-heading">Available Rides</h3>
                    {rides.length > 0 ? (
                        <div className="rides-container">
                            <div className="rides-header">
                                <span>Start Location</span>
                                <span>End Location</span>
                                <span>Date & Time</span>
                            </div>
                            {rides.map((ride) => (
                                <Link to={`/rides/${ride._id}`} key={ride._id} className="ride-row">
                                    <span>{ride.startLocation}</span>
                                    <span>{ride.endLocation}</span>
                                    <span>{new Date(ride.date).toLocaleString()}</span>
                                </Link>
                            ))}
                        </div>



                    ) : (<p className="no-rides">No rides available</p>)}
                </div>
            </div>
        </div>
    );

};

export default Profile;
