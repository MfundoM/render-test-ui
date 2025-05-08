import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';

const PolicyView = () => {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/policies/${id}`)
      .then(response => setPolicy(response.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  console.log(policy);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/policies/${id}/download`, {
        responseType: 'blob',
      });

      console.log(response.data);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Policy-${policy.policy_no}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>;

  if (!policy) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info text-center">
          Policy not found.
        </div>
      </div>
    );
  }

  const { policy_holder, drivers, vehicles } = policy;

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => navigate(-1)}>
          Back
        </button>
        <button className="btn btn-sm btn-success" onClick={handleDownload}>
          {loading ? 'Processing...' : 'Download Policy Certificate'}
        </button>
      </div>

      <h2 className="mb-4">Policy Overview</h2>

      <div className="card mb-3">
        <div className="card-header">Policy Information</div>
        <div className="card-body">
          <p><strong>ID:</strong> {policy.id}</p>
          <p><strong>Policy No.:</strong> {policy.policy_no}</p>
          <p><strong>Status:</strong> {policy.policy_status}</p>
          <p><strong>Start Date:</strong> {policy.policy_effective_date}</p>
          <p><strong>End Date:</strong> {policy.policy_expiration_date}</p>
          <p><strong>Type:</strong> {policy.policy_type}</p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">Policy Holder</div>
        <div className="card-body">
          <p><strong>Name:</strong> {policy_holder.first_name} {policy_holder.last_name}</p>
          <p><strong>Address:</strong> {policy_holder.address.street}, {policy_holder.address.city}, {policy_holder.address.state}, {policy_holder.address.zip}</p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">Drivers</div>
        <div className="card-body">
          {drivers?.length ? (
            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Marital Status</th>
                    <th>License</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th>Issued</th>
                    <th>Expires</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(driver => (
                    <tr key={driver.id}>
                      <td>{driver.first_name} {driver.last_name}</td>
                      <td>{driver.gender}</td>
                      <td>{driver.age}</td>
                      <td>{driver.marital_status}</td>
                      <td>{driver.license_number}</td>
                      <td>{driver.license_class}</td>
                      <td>{driver.license_status}</td>
                      <td>{driver.license_effective_date}</td>
                      <td>{driver.license_expiration_date}</td>
                      <td>{driver.license_state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p>No drivers found.</p>}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">Vehicles</div>
        <div className="card-body">
          {vehicles?.length ? (
            vehicles.map(vehicle => (
              <div key={vehicle.id} className="mb-4 border-bottom pb-3">
                <h5>{vehicle.make} {vehicle.model} ({vehicle.year})</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>VIN:</strong> {vehicle.vin}</p>
                    <p><strong>Ownership:</strong> {vehicle.ownership}</p>
                    <p><strong>Usage:</strong> {vehicle.usage}</p>
                    <p><strong>Primary Use:</strong> {vehicle.primary_use}</p>
                    <p><strong>Annual Mileage:</strong> {vehicle.annual_mileage}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mt-3">Garaging Address</h6>
                    <p>{vehicle.garaging_address.street}, {vehicle.garaging_address.city}, {vehicle.garaging_address.state}, {vehicle.garaging_address.zip}</p>
                  </div>
                </div>

                <h6 className="mt-3">Coverages</h6>
                {vehicle.coverages?.length ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Limit</th>
                          <th>Deductible</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicle.coverages.map(coverage => (
                          <tr key={coverage.id}>
                            <td>{coverage.type}</td>
                            <td>{coverage.limit.toLocaleString()}</td>
                            <td>{coverage.deductible}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-muted">No coverages found.</p>}
              </div>
            ))
          ) : <p>No vehicles found.</p>}
        </div>
      </div>
      <div className="text-end mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default PolicyView;
