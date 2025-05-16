import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import UserNavbar from "./UserNavbar";

const socket = io("http://localhost:5000");

const VendeurCommandes = () => {
  


  const [commandes, setCommandes] = useState([]);
  const vendeurId = localStorage.getItem("vendeurId");


  useEffect(() => {
    
    if (vendeurId) fetchCommandes();
  }, [vendeurId]);

  const fetchCommandes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/by-vendeur/${vendeurId}`);
      const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setCommandes(sorted);
    } catch (err) { 
      console.error("Erreur lors du chargement des commandes :", err);
    }
  };

  const handleAction = async (orderId, action) => {
    try {
      const url = action === "confirm"
        ? `http://localhost:5000/api/orders/confirm-product/${orderId}/${vendeurId}`
        : `http://localhost:5000/api/orders/cancel/${orderId}/${vendeurId}`;

      const response = await axios.put(url);
      const { clientId } = response.data;

      if (clientId) {
        const type = action === "confirm" ? "confirmation" : "annulation";
        const message = action === "confirm"
          ? "Votre commande a été confirmée "
          : "Votre commande a été annulée ";
      
        socket.emit("notification", {
          to: clientId,
          message,
          from: vendeurId,
          type,
        });
      }
      

      fetchCommandes();
    } catch (error) {
      console.error("Erreur lors de l'action vendeur :", error);
      alert("Une erreur est survenue lors de l'action.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "en attente": return "bg-yellow-400 text-white";
      case "confirmée": return "bg-blue-500 text-white";
      case "annulée": return "bg-red-500 text-white";
      case "livrée": return "bg-green-600 text-white";
      default: return "bg-gray-300 text-black";
    }
  };

  const getCommandeTitle = (status) => {
    if (status === "confirmée") return "Commande : Confirmée";
    if (status === "annulée") return "Commande : Annulée";
    return "Commande en attente";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">📦 Commandes Reçues</h2>

        {commandes.length === 0 ? (
          <p className="text-center text-gray-500">Aucune commande reçue pour vos produits.</p>
        ) : (
          <div className="space-y-6">
            {commandes.map((cmd) => (
              <div key={cmd._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold text-gray-800">{getCommandeTitle(cmd.status)}</h4>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(cmd.status)}`}>
                    {cmd.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {cmd.products.map((prod, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 border-b pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`http://localhost:5000/uploads/${prod.productId?.image || 'no-image.png'}`}
                          alt={prod.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-700">{prod.productName}</p>
                          <p className="text-sm text-gray-500">{prod.quantity} x {prod.price} DT</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(prod.status)}`}>
                          {prod.status}
                        </span>
                        {prod.status === "en attente" && (
                          <>
                            <button
                              onClick={() => handleAction(cmd._id, "confirm")}
                              className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600 transition"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => handleAction(cmd._id, "cancel")}
                              className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 transition"
                            >
                              Annuler
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Client :</strong> {cmd.clientName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendeurCommandes;
