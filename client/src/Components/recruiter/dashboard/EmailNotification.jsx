import React, { useState } from 'react';

const notificationsList = [
  {
    id: 1,
    title: 'New Job Assigned',
    desc: 'Get News about product and feature updates.',
    main: 'Notification from us',
    sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.'
  },
  {
    id: 2,
    title: 'Candidate No-show',
    desc: 'Get News about product and feature updates.',
    main: 'Notification from us',
    sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.'
  },
  {
    id: 3,
    title: 'Candidate No-show',
    desc: 'Get News about product and feature updates.',
    main: 'Notification from us',
    sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.'
  },
  {
    id: 4,
    title: 'Scorecard Submission Reminder',
    desc: 'Get News about product and feature updates.',
    main: 'Notification from us',
    sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.'
  },
  {
    id: 5,
    title: 'Deadline Reminder',
    desc: 'Get News about product and feature updates.',
    main: 'Notification from us',
    sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.'
  },
];

export default function EmailNotification() {
  // Initial state: all enabled except Scorecard Submission Reminder
  const [toggles, setToggles] = useState({
    1: true,
    2: true,
    3: true,
    4: false,
    5: true,
  });

  const handleToggle = (id) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 mt-2">Email Notification</h1>
      <p className="text-gray-500 mb-8 max-w-2xl">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque at velit, ipsum turpis scelerisque facilisi nisl. Arcu ullamcorper a in molestie et risus pulvinar orci vel.
      </p>
      <div className="space-y-6">
        {notificationsList.map((notif, idx) => (
          <div key={notif.id} className="flex items-center justify-between border-b last:border-b-0 border-gray-200 py-6">
            {/* Left: Main + Sub */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-base text-gray-900 mb-1">{notif.main}</div>
              <div className="text-gray-500 text-sm max-w-xl">{notif.sub}</div>
            </div>
            {/* Center: Toggle */}
            <div className="flex flex-col items-center px-8">
              <button
                type="button"
                aria-pressed={toggles[notif.id]}
                onClick={() => handleToggle(notif.id)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${toggles[notif.id] ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className="sr-only">Toggle notification</span>
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${toggles[notif.id] ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
              <span className="mt-2 text-xs font-medium text-gray-700">
                {toggles[notif.id] ? <span className="text-blue-600">Yes</span> : <span className="text-gray-400">NO</span>}
              </span>
            </div>
            {/* Right: Title + Desc */}
            <div className="flex flex-col items-start min-w-[200px] ml-4">
              <span className="font-semibold text-base text-gray-900">{notif.title}</span>
              <span className="text-gray-400 text-xs mt-1">{notif.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 