import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        axios.get('/api/policies')
            .then(response => {
                console.log(response.data.data.data);
                setPolicies(response.data.data.data);
            })
            .catch(err => {
                console.error(err);
                setPolicies([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) return;

        try {
            await axios.delete(`/api/policies/${id}`);
            setPolicies(policies.filter(policy => policy.id !== id));
        } catch (err) {
            alert('Failed to delete policy.');
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>;

    return (
        <div className="d-flex" id="wrapper">
            <div id="page-content-wrapper" className="flex-grow-1">
                <div className="container-fluid mt-4">
                    <div className="d-flex align-items-center mt-4">
                        <h1 className="mb-0">Dashboard</h1>
                        <Link to="/policies/create" className="ms-auto">
                            <button className="btn btn-sm btn-success">Apply for a policy</button>
                        </Link>
                    </div>
                    {policies.length === 0 ? (
                        <div className="alert alert-info text-center">
                            You don't have any policies, click <Link to='/policies/create'>here</Link> to apply a policy.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Policy ID</th>
                                        <th>Holder Name</th>
                                        <th>Policy Number</th>
                                        <th>Policy Status</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {policies.map(policy => (
                                        <tr key={policy.id}>
                                            <td>{policy.id}</td>
                                            <td>
                                                {policy.policy_holder.first_name} {policy.policy_holder.last_name}
                                            </td>
                                            <td>{policy.policy_no}</td>
                                            <td>{policy.policy_status}</td>
                                            <td>
                                                {policy.policy_effective_date}
                                            </td>
                                            <td>
                                                {policy.policy_expiration_date}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-1" onClick={() => navigate(`/policies/${policy.id}`)}>View</button>
                                                <button className="btn btn-sm btn-warning me-1" onClick={() => navigate(`/policies/${policy.id}/edit`)}>Edit</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(policy.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
