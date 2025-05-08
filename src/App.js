import React, { useEffect, useState } from 'react';
import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import axios from './axios';
import Dashboard from './pages/Dashboard';
import PolicyView from './pages/PolicyView';
import CreatePolicy from './pages/CreatePolicy';
import UpdatePolicy from './pages/UpdatePolicy';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const cachedUser = sessionStorage.getItem('user');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }

      axios.get('/api/user')
        .then(res => {
          setUser(res.data);
          sessionStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          setUser(null);
          sessionStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>;

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <div className='container'>
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies/:id"
          element={
            <ProtectedRoute user={user}>
              <div className='container'>
                <PolicyView />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies/create"
          element={
            <ProtectedRoute user={user}>
              <div className='container'>
                <CreatePolicy />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/policies/:id/edit"
          element={
            <ProtectedRoute user={user}>
              <div className='container'>
                <UpdatePolicy />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router >
  );
}

export default App;
