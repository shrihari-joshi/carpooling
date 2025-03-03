import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import gsap from 'gsap';
import './Auth.css';

const Auth = () => {
    const usernameRef = useRef();
    const passwordRef = useRef();
    const emailRef = useRef();
    const mobileRef = useRef();
    const genderRef = useRef();
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const titleRef = useRef(null);

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
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const data = isLogin
            ? { username: usernameRef.current.value, password: passwordRef.current.value }
            : {
                username: usernameRef.current.value,
                password: passwordRef.current.value,
                email: emailRef.current.value,
                mobile: mobileRef.current.value,
                gender: genderRef.current.value,
            };

        try {
            const response = await api.post(endpoint, data);
            if (isLogin) {
                localStorage.setItem('token', response.data.token);
                navigate('/profile');
                window.location.reload();
            } else {
                alert('Registration successful! Please Login.');
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            }
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
                    {!isLogin && <input type="email" ref={emailRef} placeholder="Email" required />}
                    {!isLogin && <input type="text" ref={mobileRef} placeholder="Mobile Number" required />}
                    {!isLogin && (
                        <select ref={genderRef} required>
                            <option value="">Select Gender</option>
                            <option value="M">M</option>
                            <option value="F">F</option>
                            <option value="O">O</option>
                        </select>
                    )}
                    <button type="submit" className='login-btn'>{isLogin ? 'Login' : 'Register'}</button>
                    <button type="button" className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
                        Switch to {isLogin ? 'Register' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
