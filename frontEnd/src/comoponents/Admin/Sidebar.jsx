import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCog, FaBoxOpen, FaChartBar, FaFileAlt, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Utilisateurs", path: "/admin/dashboard", icon: <FaUserCog /> },
    { label: "Produits", path: "/admin/products", icon: <FaBoxOpen /> },
    { label: "Verfier les employés", path: "/admin/employes", icon: <FaChartBar /> },
 
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 text-gray-800 flex flex-col p-4 shadow-sm justify-between">
      <div>
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
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
      >
        <FaSignOutAlt className="text-base" />
        <span>Se déconnecter</span>
      </button>
    </aside>
  );
};

export default Sidebar;
