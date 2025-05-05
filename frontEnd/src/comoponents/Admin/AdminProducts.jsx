import React, { useEffect, useState } from "react";
import AdminUpdateProduct from "./AdminUpdateProduct";
import AdminAddProduct from "./AdminAddProduct";
import Swal from "sweetalert2";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Erreur lors du chargement des produits :", err);
    } finally {
      setLoading(false);
    }
  };
 useEffect(() => {
  fetch("http://localhost:5000/api/products")
    .then(res => res.json())
    .then(data => {
      setProducts(data); // ✅ car `data` est déjà un tableau
         fetchProducts();

    })
    .catch(err => console.error(err));
}, []);
const deleteProduct = async (id) => {
  const confirm = await Swal.fire({
    title: "Supprimer le produit ?",
    text: "Cette action est irréversible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  });

  if (confirm.isConfirmed) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Supprimé", "Le produit a été supprimé.", "success");
        fetchProducts(); // recharge les produits
      } else {
        Swal.fire("Erreur", data.message || "Échec de suppression", "error");
      }
    } catch (err) {
      Swal.fire("Erreur réseau", "Impossible de supprimer", "error");
    }
  }
};

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 Liste des Produits</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Ajouter produit
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prix</th>
                <th className="px-4 py-2">Catégorie</th>
                <th className="px-4 py-2">Vendeur</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-2">
                    <img
                      src={`http://localhost:5000/uploads/${product.image}`}
                      alt={product.name}
                      className="w-15 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">
                    <span className="line-through text-gray-400 mr-2">{product.regularPrice} TND</span>
                    <span className="text-green-600 font-semibold">{product.salePrice} TND</span>
                  </td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2">{product.vendeurId?.name || "—"}</td>
                <td className="px-4 py-2 text-center space-x-2">
  <button
    onClick={() => setEditingProduct(product)}
    className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-xs"
  >
    Modifier
  </button>
  <button
    onClick={() => deleteProduct(product._id)}
    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
  >
    Supprimer
  </button>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct && (
        <AdminUpdateProduct
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={fetchProducts}
        />
      )}

      {showAddModal && (
        <AdminAddProduct
          onClose={() => setShowAddModal(false)}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
};

export default AdminProducts;
