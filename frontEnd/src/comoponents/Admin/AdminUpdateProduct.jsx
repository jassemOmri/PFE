import React, { useState, useEffect } from "react";

const AdminUpdateProduct = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    description: "",
    regularPrice: "",
    salePrice: "",
    category: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        image: null,
        description: product.description || "",
        regularPrice: product.regularPrice || "",
        salePrice: product.salePrice || "",
        category: product.category || "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("regularPrice", formData.regularPrice);
      form.append("salePrice", formData.salePrice);
      form.append("category", formData.category);
      if (formData.image) {
        form.append("image", formData.image);
      }

      const res = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: "PUT",
        body: form,
      });

      const data = await res.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        alert("Erreur lors de la mise à jour du produit");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur réseau");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-[450px] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Modifier le produit</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nom" className="w-full p-2 border rounded" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" required />
          <input type="number" name="regularPrice" value={formData.regularPrice} onChange={handleChange} placeholder="Prix normal" className="w-full p-2 border rounded" required />
          <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="Prix promo" className="w-full p-2 border rounded" required />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Électronique">Electronique</option>
            <option value="Vêtements">Vêtements</option>
            <option value="Maison">Maison</option>
            <option value="Sports">Sports</option>
            <option value="Beauté">Beauté</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdateProduct;
