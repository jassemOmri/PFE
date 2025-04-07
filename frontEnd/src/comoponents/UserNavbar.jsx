import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import UserContext from "../context/UserContext";

const UserNavbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) return null; // Masquez la navbar si l'utilisateur n'est pas connecté

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white shadow-md z-50 h-auto">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-2xl font-extrabold text-green-500 hover:text-green-400 transition">
          MarketPlace
        </Link>

        <div className="flex items-center space-x-4">
          <PersonIcon fontSize="large" />
          <div>
            <p className="text-sm text-gray-300">{user.name}</p>
            <p className="text-xs text-green-400">{user.role}</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <LogoutIcon />
          <span>Déconnecter</span>
        </button>
      </div>
    </nav>
  );
};

export default UserNavbar;