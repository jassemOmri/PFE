import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import SearchIcon from "@mui/icons-material/Search";
import UserContext from "../context/UserContext";
import Sidebar from "./Sidebar";
import axios from "axios";
import { HiOutlineMenu } from "react-icons/hi"; // joli icône hamburger
import { io } from "socket.io-client";
import { Bell } from "lucide-react"; // Icône notification



const Navbar = ({ onSearch }) => {
  const [notificationCount, setNotificationCount] = useState(0);
const [socket, setSocket] = useState(null);

  const { user, logout } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMenu, setShowMenu] = useState(false); // État pour afficher/cacher le menu déroulant
  const [cartCount, setCartCount] = useState(0); // État pour le nombre de produits dans le panier
  const [sidebarOpen, setSidebarOpen] = useState(false);

// useEffect pour initialiser WebSocket si le client est connecté :
  useEffect(() => {
  if (user?.role === "client" || user?.role === "acheteur") {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("register_client", user.userId); // S'enregistrer auprès du serveur

    newSocket.on("order_update", (data) => {
      console.log("Notification reçue :", data);
      setNotificationCount((prev) => prev + 1); // Incrémente à chaque notif
    });

    return () => newSocket.disconnect();
  }
}, [user]);



  // Fonction pour récupérer le nombre de produits dans le panier
const fetchCartCount = async () => {
  try {
    const acheteurId = localStorage.getItem("acheteurId");
    if (!acheteurId) return;

    const response = await axios.get(`http://localhost:5000/api/cart/${acheteurId}`);
    const cart = response.data;
    setCartCount(cart.products.length);
  } catch (error) {
    console.warn("Aucun panier trouvé pour cet acheteur. Code:", error.response?.status);
    setCartCount(0); // fallback visuel
  }
};


  // Utilisez useEffect pour récupérer le nombre de produits au chargement du composant
  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const handleSearch = () => {
    if (typeof onSearch === "function") {
      onSearch(searchTerm);
    } else {
      console.error("onSearch n'est pas une fonction");
    }
  };

  return (
    <div className="pt-20">
      <nav className="fixed top-0 left-0 w-full bg-white text-gray-800 shadow-md z-50 h-auto">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
   
                    <div className="flex items-center space-x-4">
  {/* Icône Menu à gauche */}
  <button
    onClick={() => setSidebarOpen(true)}
    className="text-gray-700 hover:text-green-600 focus:outline-none text-2xl"
  >
    <HiOutlineMenu />
  </button>

  {/* Logo MarketPlace */}
  <Link
    to="/"
    className="text-2xl font-extrabold text-green-600 hover:text-green-500 transition"
  >
    MarketPlace
  </Link>
</div>

                          <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectCategory={(name) => console.log("Filtre sur", name)}
        />

          {/* Barre de recherche */}
          <div className="flex items-center flex-1 mx-6 relative">
            <input
              type="text"
              placeholder="Cherchez vos produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-l-lg bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              className="bg-green-500 px-3 py-2 rounded-r-lg hover:bg-green-400 text-white"
              onClick={handleSearch}
            >
              <SearchIcon />
            </button>
          </div>

          {/* Liens d'authentification ou profil */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {user.role === "acheteur" && (
                  <Link to="/cart" className="relative text-gray-700 hover:text-green-500">
                    <ShoppingCartCheckoutIcon fontSize="large" />
                    {/* Afficher dynamiquement le nombre de produits dans le panier */}
                    <div className="absolute -top-2 -right-2 bg-red-600 flex justify-center items-center w-6 h-6 text-white text-sm font-bold rounded-full">
                      {cartCount}
                    </div>
                  </Link>
                )}

                {/* Menu déroulant pour Profil, Paramètres et Déconnexion */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)} // Afficher/cacher le menu
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <span className="text-xs text-green-500">{user.role}</span>
                  </button>

                  {/* Menu déroulant */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Profil
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Paramètres
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Déconnecter
                      </button>
                    </div>
                    
                    
                  )}
                </div>
              </>
              
            ) : (

              <>
                <Link to="/signup">
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition">
                    S'inscrire
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                    Se connecter
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
                  <div className="relative text-gray-700 hover:text-green-500">
            <Bell size={26} />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 w-6 h-6 flex items-center justify-center text-xs font-bold text-white rounded-full">
                {notificationCount}
              </span>
            )}
          </div>

      </nav>
    </div>
  );
};

export default Navbar;