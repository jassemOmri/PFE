import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import Navbar from "../comoponents/UserNavbar";
import Footer from "../comoponents/Footer";
import { CgProfile } from "react-icons/cg";
import { ImProfile } from "react-icons/im";
import { useNavigate } from "react-router-dom";

const VendeurProfile = () => {
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/vendeur/profile/${user.userId}`);
        setProfile(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement du profil vendeur:", error);
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchProfile();
    }
  }, [user]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!profile) return <p className="text-center mt-10 text-red-500">Profil introuvable.</p>;

  const { user: userInfo, vendeur, products } = profile;

  return (
  <div className="bg-gray-50 flex flex-col min-h-screen">
  <Navbar />

  {/* ESPACEMENT entre Navbar et contenu */}
  <main className="flex-grow pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    {/* Section Profil */}
    <div className="bg-white shadow-lg rounded-2xl p-8 mb-10 w-full flex flex-col md:flex-row items-center gap-8">
      {/* Image ou icône */}
      {userInfo.imProfile ? (
        <img
          src={`http://localhost:5000/uploads/${userInfo.imProfile}`}
          alt="Profil"
          className="w-32 h-32 rounded-full object-cover border border-gray-300 shadow"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 shadow">
          <CgProfile className="text-5xl text-gray-500" />
        </div>
      )}

      {/* Infos utilisateur */}
      <div className="flex-1">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-3xl font-bold text-gray-800">{userInfo.name}</h2>
          <button
            onClick={() => navigate("/vendeur/profile/edit")}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
          >
            <ImProfile className="text-lg" />
            Modifier mon profil
          </button>
        </div>

        <div className="mt-4 space-y-1 text-gray-600">
          <p>📧 {userInfo.email}</p>
          <p>📞 {userInfo.numTele || "Téléphone non défini"}</p>
          <p>
            Vérification :
            {vendeur.verified ? (
              <span className="ml-2 text-green-600 font-semibold">✅ Vérifié</span>
            ) : (
              <span className="ml-2 text-red-500 font-semibold">⛔ Non vérifié</span>
            )}
          </p>
        </div>
      </div>
    </div>

    {/* Section Produits */}
    <section>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        🛒 Mes Produits
      </h2>
      {products.length === 0 ? (
        <p className="text-gray-500 italic">Aucun produit trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow p-4">
              <img
                src={`http://localhost:5000/uploads/${product.image}`}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="mt-2 font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-700">{product.regularPrice} DT</p>
              <p className="text-sm text-gray-500">{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  </main>

  <Footer />
</div>

  
  );
};

export default VendeurProfile;
