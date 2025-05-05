import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import { Navigate, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { ImProfile } from "react-icons/im";

const LivreurProfile = () => {
  const { user } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/livreurs/profile/${user.userId}`);
        setProfile(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du profil livreur:", error);
      }
    };

    if (user?.userId) fetchProfile();
  }, [user]);

  if (!user || user.role !== "livreur") return <Navigate to="/" />;
  if (!profile) return <div className="text-center py-20 text-gray-500">Chargement...</div>;

  const { user: userInfo, livreur } = profile;

  return (
    
    <div className="max-w-4xl mx-auto px-4 py-10">
     
      <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center">
        {userInfo.imProfile ? (
          <img
            src={`http://localhost:5000/uploads/${userInfo.imProfile}`}
            alt="Profil"
            className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-md"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
            <CgProfile className="text-5xl text-gray-400" />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            {userInfo.name}
          </h1>
          <p className="text-gray-600 mt-2">📧 {userInfo.email}</p>
          <p className="text-gray-600">📞 {userInfo.numTele || "Non défini"}</p>
          <p className="text-sm text-gray-400 mt-1">
            Vérification :{" "}
            {livreur.verified ? (
              <span className="text-green-600 font-semibold">✅ Vérifié</span>
            ) : (
              <span className="text-red-500 font-semibold">⛔ Non vérifié</span>
            )}
          </p>

          <button
            onClick={() => navigate("/livreur/profile/edit")}
            className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
          >
            <ImProfile /> Modifier mon profil
          </button>
        </div>
      </div>

      {livreur.imCin && (
        <div className="bg-white mt-6 p-4 rounded shadow text-center">
          <h3 className="font-semibold mb-2">Image CIN</h3>
          <img
            src={`http://localhost:5000/uploads/${livreur.imCin}`}
            alt="CIN"
            className="mx-auto w-64 rounded border"
          />
        </div>
      )}
    </div>
  );
};

export default LivreurProfile;
