import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Make sure this points to your API configuration

const Auth = () => {
    const usernameRef = useRef();
    const passwordRef = useRef();
    const emailRef = useRef();
    const mobileRef = useRef(); // New ref for mobile number
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const data = isLogin
            ? { username: usernameRef.current.value, password: passwordRef.current.value }
            : {
                username: usernameRef.current.value,
                password: passwordRef.current.value,
                email: emailRef.current.value,
                mobile: mobileRef.current.value
            };

        try {
            const response = await api.post(endpoint, data);
            localStorage.setItem('token', response.data.token); // Store the token
            navigate('/profile'); // Redirect to the profile page after successful login/registration
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Something went wrong'));
        }
    };

    return (
        <div>
            <h2>{isLogin ? 'Login' : 'Register'}</h2>
            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    ref={usernameRef} // Use ref for username input
                    placeholder="Username"
                    required
                />
                <input
                    type="password"
                    ref={passwordRef} // Use ref for password input
                    placeholder="Password"
                    required
                />
                {!isLogin && (
                    <input
                        type="email"
                        ref={emailRef} // Use ref for email input
                        placeholder="Email"
                        required
                    />
                )}
                {!isLogin && (
                    <input
                        type="text"
                        ref={mobileRef} // Use ref for mobile input
                        placeholder="Mobile Number"
                        required
                    />
                )}
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                <button type="button" onClick={() => setIsLogin(!isLogin)}>
                    Switch to {isLogin ? 'Register' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Auth;