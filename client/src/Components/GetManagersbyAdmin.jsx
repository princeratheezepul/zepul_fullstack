import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GetManagersByAdmin = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const creatorId = userInfo?.data?.user?._id;
        const role = userInfo?.data?.user?.type;
        const token = userInfo?.data?.accessToken;
        if (!creatorId || !role) {
          setError('User info missing');
          setLoading(false);
          return;
        }

        const response = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/admin/getmanagerbyadmin/${creatorId}`, // using route param here
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
);
        console.log(response);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch managers');
        }

        const data = await response.json();
        setManagers(data.managers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  const handleClick = (id) => {
    navigate(`/admin/managers/${id}`);
  };

  if (loading) return <div>Loading managers...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Managers Under You (Admin)</h2>
      {managers.length === 0 ? (
        <p>No managers found.</p>
      ) : (
        <ul className="space-y-3">
          {managers.map((rec) => (
            <li
              key={rec._id}
              className="border p-4 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => handleClick(rec._id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === 'Enter') handleClick(rec._id); }}
            >
              <p><strong>Email:</strong> {rec.email}</p>
              <p><strong>Type:</strong> {rec.type}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GetManagersByAdmin;
