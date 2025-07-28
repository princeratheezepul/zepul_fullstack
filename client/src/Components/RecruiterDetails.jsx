import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const RecruiterDetails = () => {
    const { id } = useParams();
    const [recruiter, setRecruiter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ email: '', type: '' });

    useEffect(() => {
        const fetchRecruiter = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${id}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || 'Failed to fetch recruiter details');
                }
                const data = await response.json();
                setRecruiter(data.recruiter);
                setFormData({ email: data.recruiter.email, type: data.recruiter.type });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecruiter();
    }, [id]);

    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update recruiter');

            const updated = await response.json();
            console.log(updated.recruiter)
            setRecruiter(updated.recruiter);
            setIsEditing(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !recruiter.isActive }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            const updated = await response.json();
            setRecruiter(updated.recruiter);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div>Loading recruiter details...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!recruiter) return <div>No recruiter found</div>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Recruiter Details</h2>

            {isEditing ? (
                <>
                    <label className="block mb-2">
                        Email:
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </label>
                    <label className="block mb-4">
                        Type:
                        <input
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded mt-1"
                        />
                    </label>
                    <button
                        onClick={handleUpdate}
                        className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <div>
                        <p><strong>Email:</strong> {recruiter.email}</p>
                        <p><strong>Type:</strong> {recruiter.type}</p>
                        <p><strong>Status:</strong> {recruiter.isActive ? 'Active' : 'Inactive'}</p>
                        {/* <p><strong>Created At:</strong> {new Date(recruiter.createdAt).toLocaleString()}</p> */}

                        <div className="mt-4 space-x-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-yellow-500 text-white px-4 py-2 rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                className={`${recruiter.isActive ? 'bg-red-600' : 'bg-green-600'
                                    } text-white px-4 py-2 rounded`}
                            >
                                {recruiter.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>

                    </div>
                    <br></br>
                    
                </>
            )}
            <div>
                        <h1 className='text-2xl font-bold'> View Recruiter Performance</h1>
                         <p><strong>Jobs Closed:</strong> {recruiter.jobsclosed}</p>
                        <p><strong>Avg TAT:</strong> {recruiter.avgTAT}</p>
                        <p><strong>Quality Heat Map:</strong> {recruiter.qualityheatmap}</p>
                        <p><strong>Red Flags:</strong>{recruiter.redflags>0? recruiter.redflags :"Goog going no red flags"}</p>

                    </div>
        </div>
    );
};

export default RecruiterDetails;
