import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full h-16 bg-gray-900 flex items-center px-6 shadow-md">
      {/* Brand Name */}
      <div className="text-white text-xl font-semibold tracking-wide flex-1">
        <NavLink to={"/"}>CyberShield</NavLink>
      </div>

      {/* Navigation Links */}
      <ul className="flex space-x-6 text-white text-lg">
        <NavLink to={"/full-traffic-report"}>
          <li className="hover:text-gray-300 cursor-pointer">Web Monitoring</li>
        </NavLink>
        <NavLink to={"/shielding"}>
          <li className="hover:text-gray-300 cursor-pointer">Shielding</li>
        </NavLink>
        <NavLink to={"/about"}>
          <li className="hover:text-gray-300 cursor-pointer">About</li>
        </NavLink>
        <NavLink to={"/documentation"}>
          <li className="hover:text-gray-300 cursor-pointer">Dox</li>
        </NavLink>
      </ul>
    </nav>
  );
};

export default Navbar;
