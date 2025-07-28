import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const Company = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [companies, setCompanies] = useState([]);
    const [editingCompanyId, setEditingCompanyId] = useState(null);
    const [industrysize, setIndustrysize] = useState('');
    const [contact, setContact] = useState('');


    const handleEditClick = (company) => {
        setEditingCompanyId(company._id);
        setName(company.name);
        setDescription(company.description);
        setWebsite(company.website);
        setLocation(company.location);
        setIndustrysize(company.industrysize || '');
        setContact(company.contact || '');
    };

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company/getcompany`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userInfo.data.accessToken}`,
                    },
                });

                const result = await response.json();
                console.log(result)
                if (response.ok) {
                    setCompanies(result.companies);
                } else {
                    setError(result.message || 'Failed to fetch companies');
                }
            } catch (err) {
                console.error('Error fetching companies:', err);
                setError('Error connecting to the backend');
            }
        };

        fetchCompanies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !description || !website || !location) {
            setError('All fields are required.');
            return;
        }

        const companyData = {
            name,
            description,
            website,
            location,
            industrysize: Number(industrysize),
            contact: Number(contact)
        };

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            let url, method;

            if (editingCompanyId) {
                url = `${import.meta.env.VITE_BACKEND_URL}/api/company/updatecompany/${editingCompanyId}`;
                method = 'PUT';
            } else {
                url = `${import.meta.env.VITE_BACKEND_URL}/api/company/addcompany`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.data.accessToken}`,
                },
                body: JSON.stringify(companyData),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(editingCompanyId ? 'Company updated successfully!' : 'Company added successfully!');
                setError('');
                setName('');
                setDescription('');
                setWebsite('');
                setLocation('');
                setIndustrysize('');
                setContact('');
                setEditingCompanyId(null);
                if (method === 'PUT') {
                    setCompanies((prev) =>
                        prev.map((comp) => (comp._id === editingCompanyId ? result.company : comp))
                    );
                } else {
                    setCompanies((prev) => [...prev, result.company]);
                }
            } else {
                setError(result.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error connecting to backend');
        }
    };


    const handleUpdate = async (companyId) => {
        const updatedCompanyData = {
            name,
            description,
            website,
            location,
            industrysize: Number(industrysize),
            contact: Number(contact)
        };

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company/updatecompany/${companyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.data.accessToken}`,
                },
                body: JSON.stringify(updatedCompanyData),
            });

            const result = await response.json();
            if (response.ok) {
                setSuccess('Company updated successfully!');
                setError('');
                setCompanies((prevCompanies) =>
                    prevCompanies.map((company) =>
                        company._id === companyId ? result.company : company
                    )
                );
            } else {
                setError(result.message || 'Failed to update company');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error connecting to the backend');
        }
    };

    const handleDelete = async (companyId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/company/deletecompany/${companyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userInfo.data.accessToken}`,
                },
            });

            const result = await response.json();
            if (response.ok) {
                setSuccess('Company deleted successfully!');
                setError('');
                setCompanies((prevCompanies) =>
                    prevCompanies.filter((company) => company._id !== companyId)
                );
            } else {
                setError(result.message || 'Failed to delete company');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error connecting to the backend');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Manage Companies</h1>

            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-semibold mb-2">Company Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-900 text-white"
                        placeholder="Enter company name"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-900 text-white"
                        placeholder="Enter company description"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Website</label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-900 text-white"
                        placeholder="Enter website URL"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-900 text-white"
                        placeholder="Enter company location"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Industry Size</label>
                    <input
                        type="number"
                        value={industrysize}
                        onChange={(e) => setIndustrysize(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-900 text-white"
                        placeholder="Enter Industry size"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Contact (Phone No.)</label>
                    <input
                        type="tel"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full p-3 border rounded-xl bg-gray-900 text-white"
                        placeholder="Enter contact number"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full p-3 bg-[#36a1b6] text-white rounded-xl hover:bg-[#2b8c9e] transition mt-6"
                >
                    Add Company
                </button>
            </form>

            <div>
                <h2 className="text-xl font-bold mb-4">All Companies</h2>
                {companies.length > 0 ? (
                    <ul className="space-y-4">
                        {companies.map((company) => (
                            <li key={company._id} className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold">{company.name}</h3>
                                <p>{company.description}</p>
                                <p>Website: <a href={company.website} className="text-blue-400" target="_blank" rel="noopener noreferrer">{company.website}</a></p>
                                <p>Location: {company.location}</p>
                                <p>Industry: {company.industrysize}</p>
                                <p>Contact: {company.contact}</p>

                                <div className="flex space-x-4 mt-4">
                                    <button onClick={() => handleEditClick(company)} className="p-2 bg-yellow-500 text-white rounded-xl">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(company._id)} className="p-2 bg-red-500 text-white rounded-xl">
                                        Delete
                                    </button>

                                    <Link to={`/manager/company/jobs/${company._id}`}>
                                        <h2 className="p-2 bg-blue-500 text-white rounded-xl">
                                            View Jobs
                                        </h2>
                                    </Link>
                                </div>
                            </li>
                        ))}

                    </ul>
                ) : (
                    <p>No companies found.</p>
                )}
            </div>
        </div>
    );
};

export default Company;
