import React from 'react';
import './App.css';
import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login/Login.js';
import Signup from './components/Auth/Signup/Signup.jsx';
import Profile from './components/Profile/Profile.js';
import RideDetails from './components/RideDetails/RideDetails.js';
import Navbar from './components/Navbar/Navbar.js';
import Home from './components/Home/Home.jsx';


const App = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
};

const Main = () => {
  const location = useLocation();

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const hideNavbar = ["/login", "/register", "/"];
  const showNavbar = !hideNavbar.includes(location.pathname);

  return (
    <div className='main'>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/rides/:id" element={<RideDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
