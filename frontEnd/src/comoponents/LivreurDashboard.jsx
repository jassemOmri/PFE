import React, { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";

const LivreurDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [disponible, setDisponible] = useState(true);

  const livreurId = localStorage.getItem("livreurId");

  useEffect(() => {
    if (livreurId) {
      checkDisponibilite();
      fetchOrders();
    }
  }, [livreurId]);

  const checkDisponibilite = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/livreur/profile/${livreurId}`);
      setDisponible(res.data.livreur.disponible);
    } catch (err) {
      console.error("Erreur disponibilité :", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
      const filtered = res.data.filter(
        (order) => order.status === "en cours" && !order.livreur
      );
      setOrders(filtered);
    } catch (err) {
      console.error("Erreur chargement commandes :", err);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      const response = await axios.put("http://localhost:5000/api/livreur/confirm-order", {
        livreurId,
        orderId,
      });

      if (response.data.success) {
        setConfirmedOrder(response.data.order);
        setOrders([]); // vider les autres
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      alert("Impossible de confirmer la commande");
    }
  };

  return (
    <div>
      <UserNavbar />
      <div className="container mx-auto p-6 min-h-screen">
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
          Tableau de Bord Livreur
        </h2>

        {!disponible ? (
          <div className="text-red-500 text-center font-medium">
            Vous êtes actuellement marqué comme indisponible. Activez votre disponibilité pour recevoir des commandes.
          </div>
        ) : confirmedOrder ? (
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800">Commande confirmée</h3>
            <p>Client: {confirmedOrder.clientName}</p>
            <p>Statut: <span className="text-green-500 font-bold">{confirmedOrder.status}</span></p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Commandes disponibles</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center">Aucune commande disponible.</p>
            ) : (
              <table className="w-full text-left border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border">Client</th>
                    <th className="p-3 border">Produits</th>
                    <th className="p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="p-3 border">{order.clientName}</td>
                      <td className="p-3 border">
                        {order.products.map((prod, i) => (
                          <div key={i}>
                            {prod.productName} x {prod.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="p-3 border">
                        <button
                          onClick={() => confirmOrder(order._id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400"
                        >
                          Prendre la commande
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LivreurDashboard;
