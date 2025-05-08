import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('All fields are required!');
            return;
        }

        try {
            await axios.get('/sanctum/csrf-cookie');

            const response = await axios.post('/api/login', form);

            sessionStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            setUser(response.data.user);
            navigate('/dashboard');

        } catch (err) {
            console.error(err);

            if (err.response && err.response.data) {
                if (typeof err.response.data.message === 'string') {
                    setError(err.response.data.message);
                } else {
                    const firstError = Object.values(err.response.data.message)[0];
                    setError(firstError);
                }
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Login</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        className="form-control mb-3"
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        value={form.email}
                    />
                    <input
                        className="form-control mb-3"
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        value={form.password}
                    />
                    <button className="btn btn-success w-100" type="submit">
                        Login
                    </button>
                </form>
                <p className="text-center mt-3 mb-0">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
