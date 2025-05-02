import React from "react";
import { NavLink } from "react-router-dom";
import { FaUserCog, FaBoxOpen, FaChartBar, FaFileAlt } from "react-icons/fa";

const Sidebar = () => {
  const menuItems = [
    { label: "Utilisateurs", path: "/admin/dashboard", icon: <FaUserCog /> },
    { label: "Produits", path: "/admin/products", icon: <FaBoxOpen /> },
    { label: "Statistiques", path: "/admin/stats", icon: <FaChartBar /> },
    { label: "Rapports", path: "/admin/reports", icon: <FaFileAlt /> },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 text-gray-800 flex flex-col p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-6 text-green-600 text-center">MarketPlace Admin</h2>
      <nav className="flex flex-col space-y-1">
        {menuItems.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-green-100 text-green-700 border-l-4 border-green-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`
            }
          >
            <span className="text-base text-green-600">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
