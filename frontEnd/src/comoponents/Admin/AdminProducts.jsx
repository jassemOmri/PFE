import React, { useEffect, useState } from "react";
import AdminUpdateProduct from "./AdminUpdateProduct";


const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);

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
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">📦 Liste des Produits</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
  <tr>
    <th className="px-4 py-2">Nom</th>
    <th className="px-4 py-2">Prix</th>
    <th className="px-4 py-2">Catégorie</th>
    <th className="px-4 py-2">Vendeur</th>
    <th className="px-4 py-2"></th>
    
  </tr>
</thead>
<tbody>
  {products.map((product) => (
    <tr key={product._id}>
      <td className="px-4 py-2">{product.name}</td>
      <td className="px-4 py-2">
            <span className="line-through text-gray-400 mr-2">{product.regularPrice} TND</span>
            <span className="text-green-600 font-semibold">{product.salePrice} TND</span>
        </td>

      <td className="px-4 py-2">{product.category}</td>
      <td className="px-4 py-2">{product.vendeurId?.name || "—"}</td>
      <td className="px-4 py-2"><button
                onClick={() => setEditingProduct(product)}
                className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-xs"
                >
                Modifier
                </button>
                {editingProduct && (
                    <AdminUpdateProduct
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSave={fetchProducts}
                    />
                    )}

                </td>
      
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
