import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CompteBloque = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const blocked = localStorage.getItem("blockedUser");
    if (blocked) {
      setUserInfo(JSON.parse(blocked));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Compte Désactivé</h1>
      <p className="text-center text-gray-800 mb-6">
        Bonjour <strong>{userInfo.userName}</strong>, votre compte ({userInfo.role}) est actuellement <strong>bloqué</strong>.<br />
        Veuillez contacter l’administrateur pour vérifier et réactiver votre compte.
      </p>
      <a
        href="mailto:admin@vip.tn"
        className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700"
      >
        Contacter l’Administrateur
      </a>
      <button
        onClick={() => navigate("/login")}
        className="mt-4 text-sm text-blue-600 hover:underline"
      >
        Retour à la page de connexion
      </button>
    </div>
  );
};

export default CompteBloque;
