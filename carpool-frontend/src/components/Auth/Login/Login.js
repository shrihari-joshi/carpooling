// src/components/Auth/Login.jsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import './Login.css';
import gsap from 'gsap';
import { useEffect } from 'react';

const Login = () => {
    const usernameRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        gsap.to(".wheel-mates span", {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.5,
            ease: "power2.out"
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            username: usernameRef.current.value,
            password: passwordRef.current.value
        };

        try {
            const response = await api.post('/auth/login', data);
            localStorage.setItem('token', response.data.token);
            navigate('/profile');
            window.location.reload();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Something went wrong'));
        }
    };

    return (
        <div>
            <div className="pixel-bg"></div>
            <div className="auth-container">
                <h2 className="wheel-mates">
                    {Array.from("Wheel Mates").map((char, i) => (
                        <span key={i}>{char}</span>
                    ))}
                </h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" ref={usernameRef} placeholder="Username" required />
                    <input type="password" ref={passwordRef} placeholder="Password" required />
                    <button type="submit" className='login-btn'>Login</button>
                </form>
                <div className="signup-link">
                    <p>Don't have an account? <a className='actuallink' href="/register">Sign Up</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
