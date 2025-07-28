import React, { useEffect, useState } from 'react';

const ManagerInfo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const managerId = userInfo?.data?.user?._id;

  useEffect(() => {
    const fetchManager = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/${managerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userInfo.data.accessToken}`,
          },
        });
        const result = await res.json();
        console.log(result);
        if (res.ok) {
          setData(result);
        } else {
          setError(result.error || 'Failed to fetch manager info');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [managerId]);

  if (loading) return <p>Loading manager info...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p>No manager data found.</p>;

  const { manager, company, jobs, recruiters } = data;

  return (
    <div className="max-w-4xl p-6 border rounded shadow bg-white space-y-6">
      <h2 className="text-2xl font-semibold">Manager Information</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {manager.fullname}</p>
        <p><strong>Email:</strong> {manager.email}</p>
      </div>

      {company && (
        <div>
          <h3 className="text-xl font-semibold mt-4">Company Created</h3>
          <p><strong>Name:</strong> {company.name}</p>
          <p><strong>Location:</strong> {company.location}</p>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mt-4">Jobs Posted</h3>
          <ul className="list-disc ml-6">
            {jobs.map((job) => (
              <li key={job._id}>
                <strong>{job.title}</strong> – {job.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recruiters && recruiters.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mt-4">Recruiters</h3>
          <ul className="list-disc ml-6">
            {recruiters.map((rec) => (
              <li key={rec._id}>{rec.name} - {rec.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ManagerInfo;
