import React from 'react';
import './App.css';
import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth/Auth.js';
import Profile from './components/Profile/Profile.js';
import RideDetails from './components/RideDetails/RideDetails.js';
import Navbar from './components/Navbar/Navbar.js';

const App = () => {
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';

    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);
  return (
    <Router>
      <div className='main'>
        <Navbar />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/profile" component={Profile} />
          <Route path="/rides/:id" element={<RideDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
