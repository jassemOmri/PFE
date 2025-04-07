import React, { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const AdminDashboard = () => {
      const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0 });

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Récupérer les utilisateurs
    axios.get("http://localhost:5000/api/admin/users")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Erreur:", error));

    // Récupérer les produits
    axios.get("http://localhost:5000/api/admin/products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Erreur:", error));

    // Récupérer les commandes
    axios.get("http://localhost:5000/api/admin/orders")
      .then((response) => setOrders(response.data))
      .catch((error) => console.error("Erreur:", error));
  }, []);

    useEffect(() => {
    // Récupérer les statistiques
    axios.get("http://localhost:5000/api/admin/stats")
      .then((response) => setStats(response.data.stats))
      .catch((error) => console.error("Erreur:", error));
  }, []);

  const data = [
    { name: "Utilisateurs", value: stats.totalUsers },
    { name: "Produits", value: stats.totalProducts },
    { name: "Commandes", value: stats.totalOrders },
  ];

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      alert("Utilisateur supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
    }
  };

  const approveProduct = async (productId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/products/${productId}/approve`);
      setProducts(products.map((product) =>
        product._id === productId ? { ...product, status: "approuvé" } : product
      ));
      alert("Produit approuvé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'approbation du produit:", error);
    }
  };

  return (
    <div>
      <UserNavbar />
      <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de Bord Administrateur</h1>

      {/* Graphique */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
        <BarChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#10B981" />
        </BarChart>
      </div>
    </div>
      <div className="container mx-auto p-6 min-h-screen">
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Tableau de Bord Administrateur</h2>

        {/* Gestion des utilisateurs */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Utilisateurs</h3>
        <table className="w-full text-left border-collapse border border-gray-200 mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Nom</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Rôle</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="p-3 border">{user.name}</td>
                <td className="p-3 border">{user.email}</td>
                <td className="p-3 border">{user.role}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gestion des produits */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Produits</h3>
        <table className="w-full text-left border-collapse border border-gray-200 mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Nom</th>
              <th className="p-3 border">Prix</th>
              <th className="p-3 border">Statut</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-3 border">{product.name}</td>
                <td className="p-3 border">${product.price}</td>
                <td className="p-3 border">{product.status}</td>
                <td className="p-3 border">
                  <button
                    onClick={() => approveProduct(product._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-400"
                  >
                    Approuver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Gestion des commandes */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Commandes</h3>
        <table className="w-full text-left border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID Commande</th>
              <th className="p-3 border">Client</th>
              <th className="p-3 border">Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="p-3 border">{order._id}</td>
                <td className="p-3 border">{order.acheteurId}</td>
                <td className="p-3 border">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;