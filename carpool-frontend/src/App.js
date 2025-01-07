import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import Profile from './components/Profile';
import RideDetails from './components/RideDetails';

const App = () => {
  return (
    <Router>
      <div style={{ backgroundColor: "#282c34", color: "whitesmoke", height: "100vh", width: "100vw" }}>
        <h1>Carpooling App</h1>
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
