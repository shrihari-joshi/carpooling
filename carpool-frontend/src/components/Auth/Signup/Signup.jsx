// src/components/Auth/Register.jsx
import React, { useRef, useEffect } from 'react';
import api from '../../../api';
import './Signup.css';
import gsap from 'gsap';

const Signup = () => {
    const usernameRef = useRef();
    const passwordRef = useRef();
    const emailRef = useRef();
    const mobileRef = useRef();
    const genderRef = useRef();

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
            password: passwordRef.current.value,
            email: emailRef.current.value,
            mobile: mobileRef.current.value,
            gender: genderRef.current.value,
        };

        try {
            await api.post('/auth/register', data);
            alert('Registration successful! Please Login.');
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Something went wrong'));
        }
    };

    return (
        <div>
            <div className="pixel-bg"></div>
            <div className="signup-container">
                <h2 className="wheel-mates">
                    {Array.from("Wheel Mates").map((char, i) => (
                        <span key={i}>{char}</span>
                    ))}
                </h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" ref={usernameRef} placeholder="Username" required />
                    <input type="password" ref={passwordRef} placeholder="Password" required />
                    <input type="email" ref={emailRef} placeholder="Email" required />
                    <input type="text" ref={mobileRef} placeholder="Mobile Number" required />
                    <select ref={genderRef} required>
                        <option value="">Select Gender</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="O">O</option>
                    </select>
                    <button type="submit" className='login-btn'>Register</button>
                </form>

            </div>
        </div>
    );
};

export default Signup;
