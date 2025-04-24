import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "./Navbar"
import Footer from "./Footer"

const MesCommandes = () => {
  const [orders, setOrders] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState("all");
  const user = JSON.parse(localStorage.getItem("user"));
  const acheteurId = user?.userId;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/api/orders/acheteur/${acheteurId}`);
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Erreur récupération commandes", err);
      }
    };

    if (acheteurId) fetchOrders();
  }, [acheteurId]);

  const filterOrders = (status) => {
    setFilteredStatus(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "en attente": return "bg-yellow-400 text-white";
      case "confirmée": return "bg-blue-500 text-white";
      case "en cours de livraison": return "bg-purple-500 text-white";
      case "livrée": return "bg-green-600 text-white";
      case "annulée": return "bg-red-500 text-white";
      default: return "bg-gray-300 text-black";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "en attente": return "🕒 En attente";
      case "confirmée": return "✅ Confirmée";
      case "en cours de livraison": return "🚚 En livraison";
      case "livrée": return "📦 Livrée";
      case "annulée": return "❌ Annulée";
      default: return "Statut inconnu";
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const displayedOrders =
    filteredStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filteredStatus);

  const buttonStyle =
    "transition-all duration-300 ease-in-out px-3 py-1 rounded-md text-sm font-medium border border-gray-300 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400";

  return (
    <div>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow p-6 border-r border-gray-200">
            <h2 className="font-bold text-lg mb-4 text-gray-700">Mon Compte</h2>
            <ul className="space-y-3">
              <li>
                <Link to={`/acheteur/${acheteurId}`} className="text-blue-600 hover:underline">Mon Profil</Link>
              </li>
              <li className="font-semibold text-gray-800">Mes Commandes</li>
              <li><button onClick={() => filterOrders("all")} className={buttonStyle}>Toutes les Commandes</button></li>
              <li><button onClick={() => filterOrders("en attente")} className={buttonStyle}> En Attente</button></li>
              <li><button onClick={() => filterOrders("confirmée")} className={buttonStyle}> Confirmées</button></li>
              <li><button onClick={() => filterOrders("en cours de livraison")} className={buttonStyle}> En Livraison</button></li>
              <li><button onClick={() => filterOrders("livrée")} className={buttonStyle}> Livrées</button></li>
              <li><button onClick={() => filterOrders("annulée")} className={buttonStyle}> Annulées</button></li>
            </ul>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mes Commandes</h1>
            {displayedOrders.length === 0 ? (
              <div className="text-center text-gray-400">Aucune commande trouvée</div>
            ) : (
              <div className="grid gap-6">
                {displayedOrders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg bg-white p-6 shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                    <h2 className={`text-lg font-semibold mb-3 ${getStatusColor(order.status)} px-3 py-1 rounded inline-block`}>
                      Commande : {getStatusLabel(order.status)}
                    </h2>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Client: {order.clientName}</p>
                        <p className="text-sm text-gray-500">Paiement: {order.paymentMethod}</p>
                        <p className="text-sm text-gray-400 italic">Passée le : {formatDateTime(order.createdAt)}</p>
                      </div>
                    </div>
                    <ul className="mt-4 text-sm text-gray-700 list-disc ml-5">
                      {order.products.map((prod, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <div>
                                              {prod.productName} x {prod.quantity} ({prod.price} DT)                          
                                                {console.log(prod)}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prod.status)}`}>
                            {getStatusLabel(prod.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MesCommandes;
