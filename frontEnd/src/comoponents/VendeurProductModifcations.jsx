import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const VendeurProductModifcations = ({ productId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    category: "",
    image: null,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${productId}`);
        const product = res.data;
        setFormData({
          name: product.name,
          description: product.description,
          regularPrice: product.regularPrice,
          salePrice: product.salePrice,
          category: product.category,
          image: null,
        });
      } catch (err) {
        Swal.fire("Erreur", "Impossible de charger le produit", "error");
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await axios.put(`http://localhost:5000/api/products/${productId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Succès", "Produit modifié avec succès", "success");
      onSave(); // pour refresh
      onClose(); // pour fermer modal
    } catch (err) {
      Swal.fire("Erreur", "Échec de la modification", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center text-green-600">✏️ Modifier le produit</h2>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nom"
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border p-2 rounded"
            rows={3}
            required
          />
          <div className="flex gap-4">
            <input
              type="number"
              name="regularPrice"
              value={formData.regularPrice}
              onChange={handleChange}
              placeholder="Prix régulier (DT)"
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              placeholder="Prix de vente (DT)"
              className="w-full border p-2 rounded"
            />
          </div>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Catégorie"
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendeurProductModifcations;
