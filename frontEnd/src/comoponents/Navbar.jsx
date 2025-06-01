import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import SearchIcon from "@mui/icons-material/Search";
import { HiOutlineMenu } from "react-icons/hi";
import { Bell } from "lucide-react";
import UserContext from "../context/UserContext";
import Sidebar from "./Sidebar";
import axios from "axios";
import { io } from "socket.io-client";
import Swal from "sweetalert2";


const Navbar = ({ onSearch }) => {
  const { user, logout } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  console.log(" Socket connecté pour :", user?.userId);

  const socketRef = useRef(null);
  console.log("user", user);
// bech n7sbo gedech me, produit fi panier
  const fetchCartCount = async () => {
    try {
      const acheteurId = localStorage.getItem("acheteurId");
      if (!acheteurId) return;
      const res = await axios.get(`http://localhost:5000/api/cart/${acheteurId}`);
      setCartCount(res.data?.products?.length || 0); // ?. => optional chaining signfie si trur passe sinon return undefined
    } catch (error) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    if (user?.role === "acheteur") {
      const socket = io("http://localhost:5000", {//ouvrire connection avec backend
        withCredentials: true,//accepte les Token 
      });
      socketRef.current = socket;

      socket.emit("register_client", user.userId); //envoyer evente ("nom de evente",id_evente)

      socket.on("order_update", (data) => { //recupere un evente depuis backend ("nome de evente ")
        console.log(" Notification reçue :", data);
      
        // Mise à jour notifications en haut
        setNotifications((prev) => [...prev, data]);//sauvgarde l'ancien evente et ajoute la nouvelle notification
      
        // Popup visuel
        if (data?.type === "confirmation") {
          Swal.fire({
            icon: "success",
            title: "Commande confirmée ",
            text: data.message,
            timer: 3000,
            showConfirmButton: false,
          });
        } else if (data?.type === "annulation") {
          Swal.fire({
            icon: "error",
            title: "Commande annulée ",
            text: data.message,
            timer: 3000,
            showConfirmButton: false,
          });
        } else if (data?.type === "en cours de livraison") {
          Swal.fire({
            icon: "info",
            title: "en cours de livraison",
            text: data.message,
            timer: 3000,
            showConfirmButton: false,
          });
        }
      
        if (data?.type === "cart_updated") {
          fetchCartCount();
        }
      });

      return () => socket.disconnect();
    }
  }, [user]);



  useEffect(() => {
    fetchCartCount();
  }, [user]);

  const handleSearch = () => {
    if (typeof onSearch === "function") {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="pt-20">
      <nav className="fixed top-0 left-0 w-full bg-white text-gray-800 shadow-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(true)} className="text-2xl text-gray-700 hover:text-green-600">
              <HiOutlineMenu />
            </button>
            <Link to="/" className="text-2xl font-extrabold text-green-600">MarketPlace</Link>
          </div>

          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onSelectCategory={() => {}} />

          <div className="flex-1 mx-6 flex">
            <input
              type="text"
              placeholder="Cherchez vos produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-lg bg-gray-100"
            />
            <button onClick={handleSearch} className="bg-green-500 px-3 py-2 rounded-r-lg text-white">
              <SearchIcon />
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {user.role === "acheteur" && (
                  <Link to="/cart" className="relative text-gray-700 hover:text-green-500">
                    <ShoppingCartCheckoutIcon fontSize="large" />
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
                      {cartCount}
                    </span>
                  </Link>
                )}

                <div className="relative text-gray-700 hover:text-green-500">
                  <button onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell size={26} />
                    {notifications.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 w-6 h-6 flex items-center justify-center text-xs font-bold text-white rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-gray-500 text-sm">Aucune notification</div>
                      ) : (
                        notifications.map((notif, index) => (
                          <div key={index} className="px-4 py-2 border-b border-gray-200 text-sm text-gray-800">
                            {notif.message}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="flex items-center">
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48 py-2">
                      <Link
                        to={
                          user.role === "vendeur"
                            ? `/vendeur/${user.userId}`
                            : user.role === "livreur"
                            ? `/livreur/${user.userId}`
                            : `/acheteur/${user.userId}`
                        }
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Profil
                      </Link>
                                                    {user.role === "acheteur" && (
                                <Link to="/MesCommandes" className="block px-4 py-2 hover:bg-gray-100">
                                  Mes Commandes
                                </Link>
                              )}
                                                                  {user.role === "livreur" && (
                                      <Link to="/livreur-dashboard" className="block px-4 py-2 hover:bg-gray-100">
                                        Mon Dashboard
                                      </Link>
                                    )}



                      <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Déconnecter</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/signup">
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400">S'inscrire</button>
                </Link>
                <Link to="/login">
                  <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Se connecter</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
