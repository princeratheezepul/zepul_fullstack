'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AssignJobs = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssigned, setIsAssigned] = useState(false); 
  const { jobid: jobId } = useParams();

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const managerId = user?.data?.user?._id;
  const token = user?.data.accessToken;

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruitor?managerId=${managerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch recruiters');
        const data = await response.json();
        setRecruiters(data.recruiters);
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchJob = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/jobs/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch job data');
        const data = await response.json();

        setIsAssigned(data.job.isAssigned || false);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (managerId && jobId) {
      fetchRecruiters();
      fetchJob();
    }
  }, [managerId, jobId, token]);

  const assignJob = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/jobs/${jobId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isAssigned: true,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to assign job');

      setIsAssigned(true);
    } catch (error) {
      console.error(error.message);
    }
  };

  const unassignJob = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/jobs/${jobId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isAssigned: false,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to unassign job');

      setIsAssigned(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Assign Job</h2>
      <h4 className='font-bold'> List of Recruiters </h4>
      <ul>
        {recruiters.map((recruiter) => (
          <li
            key={recruiter._id}
            className="mb-2 flex items-center justify-between"
          >
            <span>{recruiter.email}</span>

            <button
              onClick={assignJob}
              className="px-3 py-1 bg-blue-500 text-black rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isAssigned}
            >
                {isAssigned ? 'Assigned' : 'Assign'}
            </button>

            {isAssigned && (
              <button
                onClick={unassignJob}
                className="px-3 py-1 ml-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Unassign
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssignJobs;
