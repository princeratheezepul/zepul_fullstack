import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GetRecruitersByManager = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const creatorId = userInfo?.data?.user?._id;
        const role = userInfo?.data?.user?.type;
        console.log(creatorId)
        console.log(role)
        if (!creatorId || !role) {
          setError('User info missing');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruiter?creatorId=${creatorId}&type=${role}`
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch recruiters');
        }

        const data = await response.json();
        setRecruiters(data.recruiters);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiters();
  }, []);

  const handleClick = (id) => {
    navigate(`/manager/recruiters/${id}`);
  };

  if (loading) return <div>Loading recruiters...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Recruiters Under You (Manager)</h2>
      {recruiters.length === 0 ? (
        <p>No recruiters found.</p>
      ) : (
        <ul className="space-y-3">
          {recruiters.map((rec) => (
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
              <p><small>Created At: {new Date(rec.createdAt).toLocaleString()}</small></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GetRecruitersByManager;
