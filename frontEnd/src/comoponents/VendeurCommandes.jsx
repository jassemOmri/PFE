import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import UserNavbar from "./UserNavbar";

// 🔌 Connexion WebSocket
const socket = io("http://localhost:5000");

const VendeurCommandes = () => {
  const [commandes, setCommandes] = useState([]);
  const vendeurId = localStorage.getItem("vendeurId");

  useEffect(() => {
    if (vendeurId) {
      fetchCommandes();
    }
  }, [vendeurId]);

  const fetchCommandes = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/by-vendeur/${vendeurId}`
      );
      setCommandes(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des commandes :", err);
    }
  };

  const handleAction = async (orderId, action) => {
    try {
      const url = `http://localhost:5000/api/orders/${action}/${orderId}`;
      const response = await axios.put(url);

      // ✅ Émettre la notification WebSocket (si le clientId est retourné)
      const { clientId, clientName } = response.data;
      if (clientId) {
        const message =
          action === "confirm"
            ? "Votre commande a été confirmée ✅"
            : "Votre commande a été annulée ❌";

        socket.emit("notification", {
          to: clientId,
          message,
          from: vendeurId,
          type: "order-update",
        });
      }

      fetchCommandes(); // 🔄 Mettre à jour la liste
    } catch (error) {
      console.error("Erreur lors de l'action vendeur :", error);
      alert("Une erreur est survenue lors de l'action.");
    }
  };

  return (
    <div className="p-6">
      <UserNavbar />
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Commandes reçues
      </h2>

      {commandes.length === 0 ? (
        <p className="text-gray-500">Aucune commande reçue pour vos produits.</p>
      ) : (
        <div className="space-y-4">
          {commandes.map((cmd) => (
            <div key={cmd._id} className="bg-white shadow p-4 rounded-lg">
              <h4 className="font-semibold text-lg mb-2">
                Commande #{cmd._id}
              </h4>

              {cmd.products.map((prod, index) => (
                <div key={index} className="text-sm text-gray-700 mb-1">
                  <strong>{prod.productName}</strong> x {prod.quantity} — {prod.price} €
                </div>
              ))}

              <p className="text-sm text-gray-500">Client : {cmd.clientName}</p>
              <p className="text-sm text-gray-500 mb-3">
                Statut : {cmd.status}
              </p>

              {/* Actions */}
              <div className="space-x-3">
                <button
                  onClick={() => handleAction(cmd._id, "confirm")}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-400"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => handleAction(cmd._id, "cancel")}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendeurCommandes;
