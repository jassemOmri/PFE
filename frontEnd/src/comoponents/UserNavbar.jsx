import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";
import UserContext from "../context/UserContext";

const UserNavbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) return null;

  const profilePath = `/${user.role}/profile`;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-green-600 hover:text-green-500 transition duration-200"
        >
          MarketPlace
        </Link>

        {/* Centre (boutons vendeurs si rôle = vendeur) */}
        {user.role === "vendeur" && (
          <div className="hidden md:flex space-x-4">
            <button
              onClick={() => navigate("/vendeur-commandes")}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-600 transition"
            >
              <FaClipboardList className="text-lg" />
              Commandes
            </button>
            <button
              onClick={() => navigate("/vendeur-dashboard")}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-600 transition"
            >
              <FaChartBar className="text-lg" />
              Dashboard
            </button>
          </div>
        )}

        {/* Utilisateur & déconnexion */}
        <div className="flex items-center space-x-4">
          <div
            onClick={() => navigate(profilePath)}
            className="cursor-pointer flex items-center space-x-2 group"
          >
            <FaUserCircle className="text-3xl text-gray-600 group-hover:text-green-500 transition" />
            <div className="text-sm text-left">
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-green-500 capitalize">{user.role}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 transition px-3 py-2 rounded-lg text-white text-sm font-medium"
          >
            <FaSignOutAlt />
            <span>Déconnecter</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
