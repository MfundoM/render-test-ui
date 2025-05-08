import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = ({ setUser }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('All fields are required!');
            return;
        }

        try {
            setLoading(true);
            await axios.get('/sanctum/csrf-cookie');

            await axios.post('/api/register', formData);

            const loginForm = {
                email: formData.email,
                password: formData.password
            };

            const { data } = await axios.post('/api/login', loginForm);
            sessionStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setUser(data.user);
            navigate('/dashboard');

        } catch (err) {
            console.log(err.response?.data);
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                setError(firstError);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>;

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4">Register</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        className="form-control mb-3"
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        className="form-control mb-3"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        className="form-control mb-3"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <input
                        className="form-control mb-3"
                        type="password"
                        name="password_confirmation"
                        placeholder="Confirm Password"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                    />
                    <button className="btn btn-success w-100" type="submit">
                        Register
                    </button>
                </form>
                <p className="text-center mt-3 mb-0">
                    Already have an account? <Link to="/">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
