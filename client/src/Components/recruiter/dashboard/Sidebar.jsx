import React, { useState, useEffect } from 'react';
import { LayoutGrid, Briefcase, BarChart3, ChevronRight, Database } from 'lucide-react';

const Sidebar = ({ activeComponent, setActiveComponent }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const navItems = [
    { name: 'Dashboard', icon: <LayoutGrid /> },
    { name: 'Jobs', icon: <Briefcase /> },
    { name: 'ZepDB', icon: <Database /> },
  ];

  const handleMouseEnter = (itemName, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 8, // 8px gap from the icon
      y: rect.top + rect.height / 2
    });
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      <div className="bg-black text-white flex flex-col justify-between items-center fixed top-0 left-0 h-screen w-20 py-5">
        <div>
          <div className="mb-30 flex justify-center">
            <img src="/zepul_sidebar_logo.png" alt="Logo" className="h-6 w-6" />
          </div>
          <nav className="flex flex-col gap-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                <a
                  href="#"
                  className={`flex items-center justify-center w-12 h-12 rounded-xl text-gray-400 transition-colors duration-200 ${activeComponent === item.name ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 hover:text-white'
                    }`}
                  onClick={() => setActiveComponent(item.name)}
                  onMouseEnter={(e) => handleMouseEnter(item.name, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.icon}
                </a>
              </div>
            ))}
          </nav>
        </div>
        <div className="relative">
          <button
            onClick={() => setActiveComponent('Settings')}
            className={`w-12 h-12 flex items-center justify-center rounded-xl focus:outline-none transition-colors duration-200 cursor-pointer ${activeComponent === 'Settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'
              }`}
            onMouseEnter={(e) => handleMouseEnter('Settings', e)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src="https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png"
              alt="User avatar"
              className="w-8 h-8 rounded-full"
            />
          </button>
        </div>
      </div>
      
      {/* Tooltip rendered outside sidebar */}
      {hoveredItem && (
        <div 
          className="fixed bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-[99999] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          {hoveredItem}
          <div 
            className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent"
          ></div>
        </div>
      )}
    </>
  );
};

export default Sidebar; 