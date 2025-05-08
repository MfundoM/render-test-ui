import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useNavigate, useParams } from 'react-router-dom';

function UpdatePolicy() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);

    const [formData, setFormData] = useState({
        policy_effective_date: '',
        policy_expiration_date: '',
        policy_holder: {
            first_name: '', last_name: '', street: '', city: '', state: '', zip: ''
        },
        drivers: [],
        vehicles: []
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loading_, setLoading_] = useState(true);

    const sanitizeDriver = (driver) => ({
        id: driver.id,
        first_name: driver.first_name,
        last_name: driver.last_name,
        age: driver.age,
        gender: driver.gender,
        marital_status: driver.marital_status,
        license_number: driver.license_number,
        license_state: driver.license_state,
        license_status: driver.license_status,
        license_effective_date: driver.license_effective_date,
        license_expiration_date: driver.license_expiration_date,
        license_class: driver.license_class,
    });

    const sanitizeGaragingAddress = (address) => ({
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
    });

    const sanitizeCoverage = (coverage) => ({
        type: coverage.type,
        limit: coverage.limit,
        deductible: coverage.deductible,
    });

    const sanitizeVehicle = (vehicle) => ({
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        usage: vehicle.usage,
        primary_use: vehicle.primary_use,
        annual_mileage: vehicle.annual_mileage,
        ownership: vehicle.ownership,
        garaging_address: sanitizeGaragingAddress(vehicle.garaging_address),
        coverages: (vehicle.coverages || []).map(sanitizeCoverage),
    });

    const sanitizePolicyHolder = (holder) => ({
        first_name: holder.first_name,
        last_name: holder.last_name,
        street: holder.address.street,
        city: holder.address.city,
        state: holder.address.state,
        zip: holder.address.zip,
    });

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                await axios.get('/sanctum/csrf-cookie');

                const response = await axios.get(`/api/policies/${id}`);

                console.log(response.data);
                const policy = response.data.data;

                setPolicy(response.data.data)
                setFormData({
                    policy_effective_date: policy.policy_effective_date,
                    policy_expiration_date: policy.policy_expiration_date,
                    policy_holder: sanitizePolicyHolder(policy.policy_holder),
                    drivers: (policy.drivers || []).map(sanitizeDriver),
                    vehicles: (policy.vehicles || []).map(sanitizeVehicle),
                });
            } catch (err) {
                console.error('Failed to fetch policy', err);
                alert('Could not load policy');
            } finally {
                setLoading_(false);
            }
        };

        fetchPolicy();
    }, [id]);

    const handleChange = (e, section, index, subfield, subindex) => {
        const { name, value } = e.target;
        const updated = { ...formData };
        const updatedErrors = { ...errors };

        const getErrorKey = () => {
            if (section === 'policy_holder') return `policy_holder.${name}`;
            if (section === 'drivers') return `drivers.${index}.${name}`;
            if (section === 'vehicles') {
                if (subfield === 'garaging_address') return `vehicles.${index}.garaging_address.${name}`;
                if (subfield === 'coverages') return `vehicles.${index}.coverages.${subindex}.${name}`;
                return `vehicles.${index}.${name}`;
            }
            return name;
        };

        const errorKey = getErrorKey();
        if (updatedErrors[errorKey]) {
            delete updatedErrors[errorKey];
            setErrors(updatedErrors);
        }

        if (section === 'policy_holder') {
            updated.policy_holder[name] = value;
        } else if (section === 'drivers') {
            updated.drivers[index][name] = value;
        } else if (section === 'vehicles') {
            if (subfield === 'garaging_address') {
                updated.vehicles[index].garaging_address[name] = value;
            } else if (subfield === 'coverages') {
                updated.vehicles[index].coverages[subindex][name] = value;
            } else {
                updated.vehicles[index][name] = value;
            }
        }

        setFormData(updated);
    };

    const addDriver = () => {
        setFormData({
            ...formData,
            drivers: [...formData.drivers, {
                first_name: '', last_name: '', age: '', gender: '', marital_status: '',
                license_number: '', license_state: '', license_status: '',
                license_effective_date: '', license_expiration_date: '', license_class: ''
            }]
        });
    };

    const addVehicle = () => {
        setFormData({
            ...formData,
            vehicles: [...formData.vehicles, {
                year: '', make: '', model: '', vin: '', usage: '', primary_use: '',
                annual_mileage: '', ownership: '',
                garaging_address: { street: '', city: '', state: '', zip: '' },
                coverages: [{ type: '', limit: '', deductible: '' }]
            }]
        });
    };

    const addCoverage = (vehicleIndex) => {
        const updated = { ...formData };
        updated.vehicles[vehicleIndex].coverages.push({ type: '', limit: '', deductible: '' });
        setFormData(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('form data:', formData);

        try {
            setLoading(true);
            await axios.get('/sanctum/csrf-cookie');

            await axios.put(`/api/policies/${id}`, formData);

            alert('Policy updated successfully');
            navigate('/dashboard');

        } catch (error) {
            if (error.response?.status === 422) {
                console.log(error.response.data.errors);
                setErrors(error.response.data.errors);
            } else {
                console.error(error);
                alert('Failed to update policy');
            }
        } finally {
            setLoading(false);
        }
    };

    const removeDriver = async (index, driverId) => {
        if (formData.drivers.length <= 1) return;

        const updatedDrivers = [...formData.drivers];
        updatedDrivers.splice(index, 1);
        setFormData({ ...formData, drivers: updatedDrivers });
    };

    const removeVehicle = async (index, VehicleId) => {
        if (formData.vehicles.length <= 1) return;

        const updatedVehicles = [...formData.vehicles];
        updatedVehicles.splice(index, 1);
        setFormData({ ...formData, vehicles: updatedVehicles });
    };

    if (loading_) return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>;

    if (!policy) {
        return (
            <div className="container mt-4">
                <div className="alert alert-info text-center">
                    Policy data not found.
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center" style={{ zIndex: 1050 }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            <h2 className="text-center mb-4">Update Policy</h2>
            <form onSubmit={handleSubmit}>
                {/* Effective & Expiration Dates */}
                <div className="row">
                    <div className="col-md-6">
                        <label>Policy Effective Date</label>
                        <input
                            className={`form-control mb-3 ${errors.policy_effective_date ? 'is-invalid' : ''}`}
                            type="date"
                            name="policy_effective_date"
                            value={formData.policy_effective_date}
                            onChange={(e) => {
                                const effectiveDate = e.target.value;
                                let expirationDate = '';
                                if (/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)) {
                                    const parsedDate = new Date(effectiveDate);
                                    parsedDate.setFullYear(parsedDate.getFullYear() + 1);
                                    expirationDate = parsedDate.toISOString().split('T')[0];
                                }
                                setFormData({
                                    ...formData,
                                    policy_effective_date: effectiveDate,
                                    policy_expiration_date: expirationDate,
                                });
                            }}
                        />
                        {errors.policy_effective_date && <div className="invalid-feedback">{errors.policy_effective_date[0]}</div>}
                    </div>

                    <div className="col-md-6">
                        <label>Policy Expiration Date</label>
                        <input
                            className={`form-control mb-3 ${errors.policy_expiration_date ? 'is-invalid' : ''}`}
                            type="date"
                            name="policy_expiration_date"
                            value={formData.policy_expiration_date}
                            onChange={(e) => setFormData({ ...formData, policy_expiration_date: e.target.value })}
                            readOnly
                        />
                        {errors.policy_expiration_date && <div className="invalid-feedback">{errors.policy_expiration_date[0]}</div>}
                    </div>
                </div>

                {/* Policy Holder */}
                <h4>Policy Holder</h4>
                <div className="row">
                    {formData.policy_holder && Object.entries(formData.policy_holder).map(([key, val]) => (
                        <div className="col-md-6 mb-3" key={key}>
                            <input
                                className={`form-control ${errors[`policy_holder.${key}`] ? 'is-invalid' : ''}`}
                                name={key}
                                placeholder={key.replace('_', ' ')}
                                value={val}
                                onChange={(e) => handleChange(e, 'policy_holder')}
                            />
                            {errors[`policy_holder.${key}`] && (
                                <div className="invalid-feedback">{errors[`policy_holder.${key}`][0]}</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Drivers */}
                <h4>Drivers</h4>
                {formData.drivers.map((driver, i) => (
                    <div key={i} className="border p-3 mb-3">
                        <div className="row">
                            {Object.entries(driver).map(([key, val]) => (
                                key !== 'id' && (
                                    <div className="col-md-6 mb-2" key={key}>
                                        <input
                                            className={`form-control ${errors[`drivers.${i}.${key}`] ? 'is-invalid' : ''}`}
                                            name={key}
                                            type={key.includes('date') ? 'date' : 'text'}
                                            placeholder={key.replace(/_/g, ' ')}
                                            value={val}
                                            onChange={(e) => handleChange(e, 'drivers', i)}
                                        />
                                        {errors[`drivers.${i}.${key}`] && (
                                            <div className="invalid-feedback">{errors[`drivers.${i}.${key}`][0]}</div>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                        {formData.drivers.length > 1 && (
                            <div className="text-end">
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeDriver(i, driver.id)}
                                >
                                    Remove Driver
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <button type="button" className="btn btn-outline-success mb-3" onClick={addDriver}>Add Driver</button>

                {/* Vehicles */}
                <h4>Vehicles</h4>
                {formData.vehicles.map((vehicle, vIndex) => (
                    <div key={vIndex} className="border p-3 mb-3">
                        <h5>Vehicle #{vIndex + 1}</h5>
                        <div className="row">
                            {Object.entries(vehicle)
                                .filter(([key]) => !['id', 'policy_id', 'created_at', 'updated_at', 'garaging_address', 'coverages'].includes(key))
                                .map(([key, val]) => (
                                    <div className="col-md-6 mb-2" key={key}>
                                        <input
                                            className={`form-control ${errors[`vehicles.${vIndex}.${key}`] ? 'is-invalid' : ''}`}
                                            name={key}
                                            placeholder={key.replace(/_/g, ' ')}
                                            value={val}
                                            onChange={(e) => handleChange(e, 'vehicles', vIndex)}
                                        />
                                        {errors[`vehicles.${vIndex}.${key}`] && (
                                            <div className="invalid-feedback">{errors[`vehicles.${vIndex}.${key}`][0]}</div>
                                        )}
                                    </div>
                                ))}
                        </div>

                        {/* Garaging Address */}
                        <h6>Garaging Address</h6>
                        <div className="row">
                            {Object.entries(vehicle.garaging_address).map(([key, val]) => (
                                <div className="col-md-6 mb-2" key={key}>
                                    <input
                                        className={`form-control ${errors[`vehicles.${vIndex}.garaging_address.${key}`] ? 'is-invalid' : ''}`}
                                        name={key}
                                        placeholder={key.replace('_', ' ')}
                                        value={val}
                                        onChange={(e) => handleChange(e, 'vehicles', vIndex, 'garaging_address')}
                                    />
                                    {errors[`vehicles.${vIndex}.garaging_address.${key}`] && (
                                        <div className="invalid-feedback">{errors[`vehicles.${vIndex}.garaging_address.${key}`][0]}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Coverages */}
                        <h6>Coverages</h6>
                        {vehicle.coverages.map((coverage, cIndex) => (
                            <div key={cIndex} className="row">
                                {Object.entries(coverage).map(([key, val]) => (
                                    <div className="col-md-4 mb-2" key={key}>
                                        <input
                                            className={`form-control ${errors[`vehicles.${vIndex}.coverages.${cIndex}.${key}`] ? 'is-invalid' : ''}`}
                                            name={key}
                                            placeholder={key.replace(/_/g, ' ')}
                                            value={val}
                                            onChange={(e) => handleChange(e, 'vehicles', vIndex, 'coverages', cIndex)}
                                        />
                                        {errors[`vehicles.${vIndex}.coverages.${cIndex}.${key}`] && (
                                            <div className="invalid-feedback">
                                                {errors[`vehicles.${vIndex}.coverages.${cIndex}.${key}`][0]}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => addCoverage(vIndex)}>
                            Add Coverage
                        </button>

                        {formData.vehicles.length > 1 && (
                            <div className="text-end mt-2">
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeVehicle(vIndex, vehicle.id)}
                                >
                                    Remove Vehicle
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {Object.keys(errors).length > 0 && (
                    <p className="text-danger text-center">
                        Please review the form. Some fields are invalid or missing.
                    </p>
                )}
                <button type="button" className="btn btn-outline-success mb-3" onClick={addVehicle}>Add Vehicle</button>

                <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
                    <button className="btn btn-success" type="submit">Update Policy</button>
                </div>
            </form>
        </div>
    );
}

export default UpdatePolicy;
