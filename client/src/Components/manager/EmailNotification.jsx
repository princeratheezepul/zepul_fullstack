import React, { useState } from 'react';

const notifications = [
  {
    id: 1,
    title: 'Notification from us',
    desc: 'Stay informed about new job assignments and recruitment opportunities that match your team\'s expertise and current workload.',
    enabled: true,
    type: 'New Job Assigned',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 2,
    title: 'Notification from us',
    desc: 'Receive alerts when candidates miss scheduled interviews to help you quickly reschedule or find alternative candidates.',
    enabled: true,
    type: 'Candidate No-show',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 3,
    title: 'Notification from us',
    desc: 'Get updates on interview schedule changes and modifications to keep your recruitment process running smoothly.',
    enabled: true,
    type: 'Candidate No-show',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 4,
    title: 'Notification from us',
    desc: 'Receive gentle reminders to submit candidate evaluations and feedback within the specified timeframe.',
    enabled: false,
    type: 'Scorecard Submission Reminder',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 5,
    title: 'Notification from us',
    desc: 'Stay on top of important deadlines for job postings, candidate submissions, and other time-sensitive activities.',
    enabled: true,
    type: 'Deadline Reminder',
    sub: 'Get News about product and feature updates.'
  },
];

const EmailNotification = () => {
  const [toggles, setToggles] = useState(notifications.map(n => n.enabled));

  const handleToggle = idx => {
    setToggles(toggles => toggles.map((t, i) => i === idx ? !t : t));
  };

  return (
    <div className="w-full max-w-5xl pt-4">
      <div className="text-3xl font-bold text-black mb-1">Email Notification</div>
      <p className="text-base text-gray-500 mb-8 max-w-2xl">
        Customize your email notification preferences to stay informed about important recruitment activities and ensure you never miss critical updates that affect your team's workflow.
      </p>
      <div className="bg-white rounded-xl shadow border border-gray-200 divide-y divide-gray-200">
        {notifications.map((n, idx) => (
          <div key={n.id} className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-6 gap-4">
            {/* Left: Title and desc */}
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold text-gray-900 mb-1">{n.title}</div>
              <div className="text-gray-400 text-sm max-w-xs">{n.desc}</div>
            </div>
            {/* Center: Switch */}
                         <div className="flex items-center gap-2 min-w-[90px]">
               <button
                 type="button"
                                   style={{
                    position: 'relative',
                    display: 'inline-flex',
                    height: '24px',
                    width: '44px',
                    border: '2px solid transparent',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    backgroundColor: toggles[idx] ? '#2563eb' : '#d1d5db'
                  }}
                 onClick={() => handleToggle(idx)}
                 aria-pressed={toggles[idx]}
               >
                 <span className="sr-only">Toggle notification</span>
                                   <span 
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: toggles[idx] ? '22px' : '2px',
                      height: '16px',
                      width: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
               </button>
               <span className={`ml-2 text-sm font-medium ${toggles[idx] ? 'text-blue-600' : 'text-gray-400'}`}>{toggles[idx] ? 'Yes' : 'NO'}</span>
             </div>
            {/* Right: Type and subdesc */}
            <div className="flex flex-col min-w-[180px]">
              <span className="font-semibold text-gray-900">{n.type}</span>
              <span className="text-gray-400 text-xs">{n.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailNotification; 