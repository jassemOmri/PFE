import React, { useState } from "react";
import Swal from "sweetalert2";

const AdminAddProduct = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    category: "",
    image: null,
    email: "", // ✅ remplacer vendeurId par email
  });

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
      form.append("image", formData.image);
      form.append("email", formData.email); // ✅ envoie email vendeur

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/products/admin-add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form,
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Produit ajouté",
          text: "Le produit a été ajouté avec succès.",
          timer: 2000,
          showConfirmButton: false,
        });
        onSave();
        onClose();
      } else {
        Swal.fire("Erreur", data.message || "Échec de l’ajout.", "error");
      }
    } catch (err) {
      console.error("Erreur création produit:", err);
      Swal.fire("Erreur réseau", "Impossible d’envoyer les données.", "error");
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
        <h2 className="text-xl font-semibold mb-4">Ajouter un produit</h2>
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
            name="image"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
            required
          />

          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email du vendeur"
            className="w-full p-2 border rounded"
            required
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
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;
