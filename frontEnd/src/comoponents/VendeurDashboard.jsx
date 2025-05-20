import React, { useState, useEffect } from "react";
import axios from "axios";
import UserNavbar from "./UserNavbar";
import categoriesData from "../data/categoriesData"; // chemin selon ta structure
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import VendeurProductModifcations from "./VendeurProductModifcations";



const VendeurDashboard = () => {
  const [vendeurData, setVendeurData] = useState(null); // ⬅️ في أعلى الملف
  const handleDelete = async (productId) => {
  const result = await Swal.fire({
    title: "Supprimer le produit ?",
    text: "Cette action est irréversible.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e3342f",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Oui, supprimer !",
    cancelButtonText: "Annuler",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      Swal.fire("Supprimé !", "Le produit a été supprimé.", "success");
      fetchProducts(vendeurId); // Refresh la liste
    } catch (error) {
      Swal.fire("Erreur", "Impossible de supprimer le produit.", "error");
      console.error("Erreur suppression:", error);
    }
  }
};

const navigate = useNavigate();

const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [profileOk, setProfileOk] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    image: null,
    category: "",
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vendeurId, setVendeurId] = useState(null); //  mettre vendeurId dans le state Reac

  // 1️⃣ Lire vendeurId au chargement
  useEffect(() => {
    const storedId = localStorage.getItem("vendeurId");
    if (!storedId) {
      console.warn("⚠️ vendeurId manquant dans localStorage");
      return;
    }
    setVendeurId(storedId);
    setCategories(categoriesData);
     // ✅ Charger vendeur vérification
  const fetchVendeurData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vendeurs/profile/${storedId}`);
      setVendeurData(res.data.vendeur);
    } catch (err) {
      console.error("Erreur fetch vendeur:", err);
    }
  };
  fetchVendeurData();
  }, []);

  // 2️⃣ Charger les produits dès que vendeurId est dispo
   const fetchProducts = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/vendeur/${id}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };


  useEffect(() => {
    if (vendeurId) {
      fetchProducts(vendeurId);
    }
  }, [vendeurId]);

 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Veuillez vous connecter pour ajouter un produit");
    return;
  }

  // ✅ Vérification du profil vendeur
  try {
    const profileRes = await axios.get(`http://localhost:5000/api/vendeurs/profile/${vendeurId}`);
    const { user: u, vendeur } = profileRes.data;

    const hasAdresse =
      u.addPostale?.rue &&
      u.addPostale?.ville &&
      u.addPostale?.region &&
      u.addPostale?.pays &&
      u.addPostale?.codePostal;

    const profilComplet =
      u.numTele && vendeur?.imCin && hasAdresse && vendeur.lat && vendeur.lng;

    if (!profilComplet) {
   Swal.fire({
  icon: "warning",
  title: "Profil incomplet",
  text: "Veuillez compléter votre profil (CIN, téléphone, adresse postale et position GPS) avant d'ajouter un produit.",
  confirmButtonText: "Aller au profil"
}).then((result) => {
  if (result.isConfirmed) {
    navigate("/vendeur/profile/edit"); // ✅ Redirection SPA
  }
});

      return;
    }

    //  Si tout va bien → continuer ajout produit
    if (
      !newProduct.name ||
      !newProduct.description ||
      !newProduct.regularPrice ||
      !newProduct.image ||
      !newProduct.category
    ) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("regularPrice", newProduct.regularPrice);
    formData.append("salePrice", newProduct.salePrice);
    formData.append("category", newProduct.category);
    formData.append("image", newProduct.image);

    await axios.post("http://localhost:5000/api/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Produit ajouté avec succès !");
    setNewProduct({
      name: "",
      description: "",
      regularPrice: "",
      salePrice: "",
      image: null,
      category: "",
    });
    fetchProducts(vendeurId);
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    alert("Erreur lors de l'ajout du produit");
  }
};

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div>
      <UserNavbar />
         
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Vendeur</h1>
        {vendeurData && !vendeurData.verified && (
  <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-3 rounded mb-6 text-sm">
     Bonjour vendeur, merci pour votre inscription. <br />
     Votre profil est en cours de vérification. Veuillez patienter 24 à 48 heures pendant que l'admin examine vos informations.
  </div>
)}



        {/* Filtre par catégorie */}
        <div className="mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Disposition inversée : formulaire à droite */}
        <div className="flex flex-col lg:flex-row-reverse gap-6">
          {/* Formulaire */}
          <div className="lg:w-1/3 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ajouter un produit</h2>
            {vendeurData?.verified ? (
            <form onSubmit={handleSubmit}>
              <InputField label="Nom du produit" name="name" value={newProduct.name} onChange={handleChange} />
              <TextAreaField label="Description" name="description" value={newProduct.description} onChange={handleChange} />
              <InputField label="Prix régulier" name="regularPrice" type="number" value={newProduct.regularPrice} onChange={handleChange} />
              <InputField label="Prix de vente" name="salePrice" type="number" value={newProduct.salePrice} onChange={handleChange} />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-400"
              >
                Ajouter le produit
              </button>
            </form>) : (
                  <p className="text-red-600 text-sm font-medium">
                     Vous ne pouvez pas ajouter de produit tant que votre profil n’est pas vérifié par l’admin.
                  </p>
                )}
          </div>

          {/* Liste des produits */}
          <div className="lg:w-2/3 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes produits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <img
                      src={`http://localhost:5000/uploads/${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <p className="text-gray-900 font-bold">${product.regularPrice}</p>
                    <div className="flex justify-between items-center mt-4">
                      <button
                              onClick={() => handleDelete(product._id)}
                              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                              Supprimer
                            </button>

                     <button
                                onClick={() => setSelectedProductId(product._id)}
                                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                              >
                                Modifier
                              </button>
        {selectedProductId && (
  <VendeurProductModifcations
    productId={selectedProductId}
    onClose={() => setSelectedProductId(null)}
    onSave={() => fetchProducts(vendeurId)}
  />
)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Champs réutilisables
const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md"
      required
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md"
      rows="4"
      required
    />

  </div>
);

export default VendeurDashboard;
