import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const AdminEmployes = () => {
  const [vendeurs, setVendeurs] = useState([]);
  const [livreurs, setLivreurs] = useState([]);

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      const token = localStorage.getItem("token");
      const [vendeursRes, livreursRes] = await Promise.all([
        fetch("http://localhost:5000/api/vendeurs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/livreurs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const vendeursData = await vendeursRes.json();
      const livreursData = await livreursRes.json();

      setVendeurs(vendeursData);
      setLivreurs(livreursData);
    } catch (err) {
      console.error("Erreur chargement employés", err);
    }
  };

  const afficherDetails = (user, role) => {
    const adresse = user.user?.addPostale || {};
    const imgProfile = user.user?.imProfile
      ? `http://localhost:5000/uploads/${user.user.imProfile}`
      : "";
    const imgCIN = user?.imCin
      ? `http://localhost:5000/uploads/${user.imCin}`
      : "";
  
    const verified = user.verified;
    const userId = user.user?._id;
  
    const html = `
    <div style="display: flex; gap: 40px; font-size: 18px; line-height: 1.8;">
  
      <!-- Partie Infos -->
      <div style="flex: 1;">
        <p><strong> Nom :</strong> ${user.user?.name || "-"}</p>
        <p><strong> Email :</strong> ${user.user?.email || "-"}</p>
        <p><strong> Téléphone :</strong> ${user.user?.numTele || "-"}</p>
        <p><strong> Adresse :</strong> ${adresse.rue || ""}, ${adresse.ville || ""}, ${adresse.region || ""}, ${adresse.pays || ""}, ${adresse.codePostal || ""}</p>
        <p><strong> Position GPS :</strong> ${user.lat?.toFixed(5) || "-"} / ${user.lng?.toFixed(5) || "-"}</p>
      </div>
  
      <!-- Partie CIN très large -->
      <div style="flex: 0 0 600px; text-align: center;">
        ${imgCIN ? `
          <p style="font-weight: bold; font-size: 20px; margin-bottom: 10px;"> CIN</p>
          <img src="${imgCIN}" style="width: 100%; max-height: 500px; object-fit: contain; border-radius: 10px; border: 1px solid #ccc;" />
        ` : "<p>Image CIN non disponible</p>"}
      </div>
    </div>
  
    <div style="margin-top: 40px; text-align: center;">
      <button id="verifierBtn" style="padding: 12px 24px; margin: 0 20px; font-size: 17px; background-color: #38a169; color: white; border: none; border-radius: 6px; cursor: pointer;">
         Vérifier
      </button>
      <button id="revoquerBtn" style="padding: 12px 24px; margin: 0 20px; font-size: 17px; background-color: #e3342f; color: white; border: none; border-radius: 6px; cursor: pointer;">
         Révoquer
      </button>
    </div>
  `;
  
  Swal.fire({
    title: `<span style="font-size: 24px;"> Détails ${role}</span>`,
    html,
    width: "50vw", 
    showConfirmButton: false,
    didOpen: () => {
      document.getElementById("verifierBtn").addEventListener("click", async () => {
        const endpoint = role === "vendeur" ? "vendeurs" : "livreurs";
        const res = await fetch(`http://localhost:5000/api/${endpoint}/verify/${userId}`, { method: "PUT" });
        const data = await res.json();
        if (data.success && data.verified) {
          Swal.fire(" Vérifié avec succès", "", "success");
          fetchEmployes();
        }
      });
  
      document.getElementById("revoquerBtn").addEventListener("click", async () => {
        const endpoint = role === "vendeur" ? "vendeurs" : "livreurs";
        const res = await fetch(`http://localhost:5000/api/${endpoint}/verify/${userId}`, { method: "PUT" });
        const data = await res.json();
        if (data.success && !data.verified) {
          Swal.fire("Révoqué avec succès", "", "success");
          fetchEmployes();
        }
      });
    },
  });
  
  };
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Liste des Employés</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vendeurs */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 text-green-700"> Vendeurs</h2>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {vendeurs.map((v) => (
                <tr
                  key={v._id}
                  className="border-b hover:bg-green-50 cursor-pointer"
                  onClick={() => afficherDetails(v, "vendeur")}
                >
                  <td className="px-4 py-2">{v.user?.name}</td>
                  <td className="px-4 py-2">{v.user?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Livreurs */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 text-blue-700"> Livreurs</h2>
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {livreurs.map((l) => (
                <tr
                  key={l._id}
                  className="border-b hover:bg-blue-50 cursor-pointer"
                  onClick={() => afficherDetails(l, "livreur")}
                >
                  <td className="px-4 py-2">{l.user?.name}</td>
                  <td className="px-4 py-2">{l.user?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployes;
