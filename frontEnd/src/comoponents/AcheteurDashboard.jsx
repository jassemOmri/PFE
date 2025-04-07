import React, { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar"; // ✅ Navbar المشترك بين المستخدمين

const AcheteurDashboard = () => {
  const [orders, setOrders] = useState([]);
const acheteurId = localStorage.getItem("userId"); // Utilisez userId au lieu de acheteurId
  useEffect(() => {
    if (acheteurId) {
      axios
        .get(`http://localhost:5000/api/orders/acheteur/${acheteurId}`)
        .then((response) => setOrders(response.data))
        .catch((error) => console.error("Erreur lors du chargement des commandes:", error));
    }
  }, [acheteurId]);

  const cancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      setOrders(orders.filter((order) => order._id !== orderId)); // ✅ تحديث القائمة بعد الإلغاء
    } catch (error) {
      console.error("Erreur lors de l'annulation de la commande:", error);
    }
  };

  const reorderProduct = async (productId) => {
    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        acheteurId,
        productId,
        quantity: 1,
      });
      alert("Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur lors du re-commande:", error);
    }
  };

  return (
    <div>
      <UserNavbar />
      <div className="container mx-auto p-6 min-h-screen">
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
          Tableau de Bord Acheteur
        </h2>

        {/* ✅ **عرض قائمة الطلبات** */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Vos Commandes</h3>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center">Aucune commande trouvée.</p>
        ) : (
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Produit</th>
                <th className="p-3 border">Quantité</th>
                <th className="p-3 border">Prix total</th>
                <th className="p-3 border">Statut</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="p-3 border flex items-center">
                    <img
                      src={`http://localhost:5000/uploads/${order.product.image}`}
                      alt={order.product.name}
                      className="w-12 h-12 object-cover rounded mr-2"
                    />
                    {order.product.name}
                  </td>
                  <td className="p-3 border">{order.quantity}</td>
                  <td className="p-3 border">${order.totalPrice}</td>
                  <td className="p-3 border font-medium text-gray-700">{order.status}</td>
                  <td className="p-3 border space-x-2">
                    {order.status === "en cours" && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
                      >
                        Annuler
                      </button>
                    )}
                    <button
                      onClick={() => reorderProduct(order.product._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400"
                    >
                      Recommander
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AcheteurDashboard;
