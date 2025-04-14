import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BadgeCheck, MapPin, Phone, ShoppingBag } from "lucide-react";

const AcheteurProfile = () => {
  const { id } = useParams();
  const [vendeur, setVendeur] = useState(null);
  const [produits, setProduits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/vendeur/${id}`);
        setVendeur(res.data.vendeur);
        setProduits(res.data.produits);
      } catch (err) {
        console.error("Erreur de chargement vendeur:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!vendeur) return <div className="text-center py-20 text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center">
        <img
          src={`http://localhost:5000/uploads/${vendeur.photo}`}
          alt="Vendeur"
          className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-md"
        />
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            {vendeur.name} <BadgeCheck className="text-green-500" size={24} />
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Phone size={16} /> {vendeur.phone}
          </p>
          <p className="text-gray-600 flex items-center gap-2">
            <MapPin size={16} /> {vendeur.region}, {vendeur.country}
          </p>
          <p className="text-sm text-gray-400 mt-1">Membre depuis 2023</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4 flex items-center gap-2">
        <ShoppingBag /> Produits de {vendeur.name}
      </h2>
      {produits.length === 0 ? (
        <p className="text-gray-500">Aucun produit disponible.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {produits.map((p) => (
            <div
              key={p._id}
              className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                alt={p.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-md font-bold text-gray-800 truncate">{p.name}</h3>
                <p className="text-green-600 font-semibold mt-1">${p.regularPrice}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcheteurProfile;
