import React from 'react';

/**
 * JobSidebar - A right-side sliding drawer for job details
 * Props:
 *   open: boolean - whether the sidebar is visible
 *   onClose: function - called when the sidebar should close
 *   children: ReactNode - content to render inside the sidebar
 */
const JobSidebar = ({ open, onClose, children }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-transparent z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[50vw] max-w-[700px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderTopLeftRadius: '2rem', borderBottomLeftRadius: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none cursor-pointer"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          &times;
        </button>
        <div className="h-full overflow-y-auto p-8 pt-16 flex flex-col">{/* Padding for close btn */}
          {children}
        </div>
      </aside>
    </>
  );
};

export default JobSidebar; 