import React, { useState } from 'react';

const notifications = [
  {
    id: 1,
    title: 'Notification from us',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
    enabled: true,
    type: 'New Job Assigned',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 2,
    title: 'Notification from us',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
    enabled: true,
    type: 'Candidate No-show',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 3,
    title: 'Notification from us',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
    enabled: true,
    type: 'Candidate No-show',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 4,
    title: 'Notification from us',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
    enabled: false,
    type: 'Scorecard Submission Reminder',
    sub: 'Get News about product and feature updates.'
  },
  {
    id: 5,
    title: 'Notification from us',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.',
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
      <h1 className="text-3xl font-bold text-black mb-1">Email Notification</h1>
      <p className="text-base text-gray-500 mb-8 max-w-2xl">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.
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
                className={`relative inline-flex h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200 focus:outline-none ${toggles[idx] ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => handleToggle(idx)}
                aria-pressed={toggles[idx]}
              >
                <span className="sr-only">Toggle notification</span>
                <span
                  className={`inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition duration-200 ${toggles[idx] ? 'translate-x-5' : 'translate-x-0'}`}
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