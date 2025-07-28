import React from 'react';
import { LayoutGrid, Briefcase, BarChart3, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeComponent, setActiveComponent }) => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutGrid /> },
    { name: 'Jobs', icon: <Briefcase /> },

  ];

  return (
    <div className="bg-black text-white flex flex-col justify-between items-center fixed top-0 left-0 h-screen w-20 py-5">
      <div>
        <div className="mb-30 flex justify-center">

          <img src="/zepul_sidebar_logo.png" alt="Logo" className="h-6 w-6" />

        </div>
        <nav className="flex flex-col gap-8">
          {navItems.map((item) => (
            <a
              href="#"
              key={item.name}
              className={`flex items-center justify-center w-12 h-12 rounded-xl text-gray-400 transition-colors duration-200 ${activeComponent === item.name ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 hover:text-white'
                }`}
              onClick={() => setActiveComponent(item.name)}
            >
              {item.icon}
            </a>
          ))}
        </nav>
      </div>
      <button
        onClick={() => setActiveComponent('Settings')}
        className={`w-12 h-12 flex items-center justify-center rounded-xl focus:outline-none transition-colors duration-200 cursor-pointer ${activeComponent === 'Settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
          }`}
      >
        <img
          src="https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png"
          alt="User avatar"
          className="w-8 h-8 rounded-full"
        />
      </button>
    </div>
  );
};

export default Sidebar; 