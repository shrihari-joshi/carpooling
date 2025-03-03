import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, User, Settings, LogOut } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in (based on token)
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    // Toggle dark mode
    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
        document.body.classList.toggle("dark-mode");
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/"); // Redirect to login page
    };

    return (
        <nav className="navbar">
            <h1 className="logo">Wheel Mates</h1>
            <div className="nav-links">
                <Link to="/profile" className="nav-item">
                    <User size={20} /> Profile
                </Link>
                <Link to="/settings" className="nav-item">
                    <Settings size={20} /> Settings
                </Link>
                <button className="nav-item theme-btn" onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {isLoggedIn && (
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
