import React from 'react';

const Navbar = () => {
  return (
    <nav className="w-full h-16 bg-gray-900 flex items-center px-6 shadow-md">
      {/* Brand Name */}
      <div className="text-white text-xl font-semibold tracking-wide flex-1">
        CyberShield
      </div>

      {/* Navigation Links */}
      <ul className="flex space-x-6 text-white text-lg">
        <li className="hover:text-gray-300 cursor-pointer">Web Monitoring</li>
        <li className="hover:text-gray-300 cursor-pointer">Shielding</li>
        <li className="hover:text-gray-300 cursor-pointer">About</li>
      </ul>
    </nav>
  );
};

export default Navbar;
