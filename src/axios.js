import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const instance = axios.create({
    baseURL,
    withCredentials: true,
});

export default instance;