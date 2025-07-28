import React, { useEffect, useState } from 'react';

const AdminInfo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const adminId = userInfo?.data?.user?._id;

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/${adminId}`, {
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
          setError(result.error || 'Failed to fetch admin info');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId]);

  if (loading) return <p>Loading admin info...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p>No admin data found.</p>;

  const { admin, company, jobs, recruiters,users} = data;

  return (
    <div className="max-w-4xl p-6 border rounded shadow bg-white space-y-6">
      <h2 className="text-2xl font-semibold">Admin Information</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {admin.fullname}</p>
        <p><strong>Email:</strong> {admin.email}</p>
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
       {users && users.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mt-4">Managers</h3>
          <ul className="list-disc ml-6">
            {users.map((user) => (
              <li key={user._id}>{user.name} - {user.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminInfo;
