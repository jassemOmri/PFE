import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import Navbar from "../comoponents/Navbar";
import Footer from "../comoponents/Footer";
import UserContext from "../context/UserContext";

const AcheteurProfil = () => {
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/acheteur/profile/${user.userId}`);
        setProfile(res.data.user);
        setLoading(false);
      } catch (error) {
        console.error("Erreur profil acheteur:", error);
        setLoading(false);
      }
    };
    if (user?.userId) {
      fetchProfile();
    }
  }, [user]);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!profile) return <p className="text-center mt-10 text-red-500">Profil introuvable.</p>;

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-10 w-full flex flex-col md:flex-row items-center gap-8">
          {profile.imProfile ? (
            <img
              src={`http://localhost:5000/uploads/${profile.imProfile}`}
              alt="Profil"
              className="w-32 h-32 rounded-full object-cover border border-gray-300 shadow"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 shadow">
              <CgProfile className="text-5xl text-gray-500" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
              <button
                onClick={() => navigate("/acheteur/profile/edit")}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 transition"
              >
                Modifier mon profil
              </button>
            </div>

            <div className="mt-4 space-y-1 text-gray-600">
              <p>📧 {profile.email}</p>
              <p>📞 {profile.numTele || "Téléphone non défini"}</p>
              <p>🎂 {profile.dateNaissance ? profile.dateNaissance.substring(0, 10) : "Date non définie"}</p>
              <p>📍 Adresse : {profile.addPostale.rue}, {profile.addPostale.ville}, {profile.addPostale.region}, {profile.addPostale.pays} {profile.addPostale.codePostal}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AcheteurProfil;
