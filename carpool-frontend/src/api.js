import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Adjust the base URL as needed
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;