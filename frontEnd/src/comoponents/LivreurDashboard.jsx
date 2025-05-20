import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, PackageCheck, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "./ui/button";
import MapComponent from "../comoponents/ui/MapComponent"
import Swal from "sweetalert2";

import UserNavbar from "./UserNavbar";
const livreurId = JSON.parse(localStorage.getItem("user"))?.userId;




const LivreurDashboard = () => {
  const [disponible, setDisponible] = useState(false);
  const [commandesDisponibles, setCommandesDisponibles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [livreurData, setLivreurData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const livreurId = user?.role === "livreur" ? user.userId : null;
  useEffect(() => {
    const fetchLivreur = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/livreurs/get-livreur/${livreurId}`);
        setLivreurData(res.data);
        setDisponible(res.data?.disponible || false);
      } catch (err) {
        console.error("Erreur lors de la récupération de la disponibilité", err);
      }
    };
    if (livreurId) fetchLivreur();
  }, [livreurId]);
  
  useEffect(() => {
    const fetchDisponibilite = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/livreurs/get-livreur/${livreurId}`);
        setDisponible(res.data?.disponible || false);

      } catch (err) {
        console.error("Erreur lors de la récupération de la disponibilité", err);
      }
    };
    if (livreurId) fetchDisponibilite();
  }, [livreurId]);

  useEffect(() => {
    if (disponible && livreurId) {
      fetchCommandesDisponibles();
    }
  }, [disponible, livreurId]);

  const fetchCommandesDisponibles = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/livreur/${livreurId}`);
      setCommandesDisponibles(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes disponibles:", error);
    }
  };

const toggleDisponibilite = async () => {
  try {
    const nouveauStatut = !disponible;

    const res = await axios.put(
      `http://localhost:5000/api/livreurs/disponible/${livreurId}`,
      { disponible: nouveauStatut }
    );

    setDisponible(nouveauStatut);

    if (nouveauStatut) {
      // Si on devient dispo → on charge les commandes
      fetchCommandesDisponibles();
    } else {
      // Si on devient indisponible → on vide la liste
      setCommandes([]);
      setCommandeSelectionnee(null); // reset sélection
    }
  } catch (err) {
    console.error("Erreur lors du changement de disponibilité", err);
  }
};

  const accepterCommande = async (orderId) => {
  try {
    const res = await axios.post("http://localhost:5000/api/livreurs/orders/accept", {
      orderId,
      livreurId,
    });

    Swal.fire({
      icon: "success",
      title: "Commande acceptée ✅",
      text: "Vous êtes désormais responsable de cette livraison.",
      timer: 2000,
      showConfirmButton: false,
    });

    setCommandesDisponibles([res.data.order]);
    setSelectedCommande(res.data.order);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: error.response?.data?.message || "Impossible d'accepter cette commande.",
    });
  }
};

const marquerCommeLivree = async (orderId) => {
  try {
    await axios.put(`http://localhost:5000/api/livreurs/orders/${orderId}/livree`);

    Swal.fire(" Livraison terminée", "Statut mis à jour", "success");

    setCommandesDisponibles([]);
    setSelectedCommande(null);
  } catch (error) {
    Swal.fire(" Erreur", "Impossible de mettre à jour la commande", "error");
  }
};

useEffect(()=>{
  fetchCommandesDisponibles();
},[])
  return (
   <div>

  <div className="fixed top-0 left-0 right-0 z-50">
    <UserNavbar />


  </div>
  {livreurData && !livreurData.verified && (
  <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-4 py-3 text-sm text-center mb-4">
    Bonjour <strong>{user?.name}</strong>, merci pour votre inscription.
    <br />
    Votre profil livreur est en cours de vérification. Veuillez patienter 24 à 48 heures pendant que l'admin examine vos documents.
  </div>
)}
<div className="pt-0">


    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar dynamique */}
      <aside
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-lg p-4 border-r flex flex-col items-center`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
        {sidebarOpen && (
          <h2 className="text-xl font-bold text-green-600 mb-8">MarketPlace</h2>
        )}
        <ul className="space-y-4 w-full">
          <li className="flex items-center space-x-2 text-gray-700 font-medium">
            <LayoutDashboard size={20} /> {sidebarOpen && <span>Dashboard</span>}
          </li>
          <li className="flex items-center space-x-2 text-gray-700 font-medium">
            <PackageCheck size={20} /> {sidebarOpen && <span>Commandes</span>}
          </li>
          <li className="flex items-center space-x-2 text-gray-700 font-medium">
            <MapPin size={20} /> {sidebarOpen && <span>Carte</span>}
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="text-center mb-6">
                      {livreurData?.verified ? (
                <button
                  onClick={toggleDisponibilite}
                  className={`px-6 py-2 rounded text-white font-semibold ${
                    disponible ? "bg-green-600" : "bg-gray-500"
                  }`}
                >
                  {disponible ? "✅ Disponible pour livraison" : "🚫 Indisponible"}
                </button>
              ) : (
                <p className="text-red-600 text-sm font-medium">
                   Vous ne pouvez pas activer votre disponibilité tant que votre profil n’est pas vérifié.
                </p>
              )}


        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Liste des commandes */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold mb-4">Commandes Disponibles</h3>
            <div className="space-y-4">
           {disponible ? (
  commandesDisponibles.length === 0 ? (
    <p className="text-gray-500">Aucune commande disponible pour l’instant.</p>
  ) : (
    commandesDisponibles.map((cmd) => (
      <div key={cmd._id} className="bg-white rounded shadow p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800">Commande de {cmd.clientName}</p>
            <p className="text-sm text-gray-500">État: {cmd.status}</p>
          </div>
          <Button onClick={() => setSelectedCommande(cmd)}>Voir</Button>
        </div>
      </div>
    ))
  )
) : (
  <p className="text-gray-400 italic">Vous êtes actuellement indisponible.</p>
)}

            </div>
          </div>

          {/* Carte */}
          <div className="col-span-2 bg-white rounded shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Carte de Livraison</h3>
            <div className="h-[400px] bg-gray-200 rounded flex items-center justify-center">
              {selectedCommande ? (
                                    <MapComponent
                                      client={{
                                        lat: selectedCommande.clientLat,
                                        lng: selectedCommande.clientLng,
                                      }}
                                      vendeur={{
                                        lat: selectedCommande.products[0].vendeurLat,
                                        lng: selectedCommande.products[0].vendeurLng,
                                      }}
                                    />
                                  ) : (
                                    <p className="text-gray-500">Cliquez sur une commande pour afficher la carte.</p>
                                  )}
                                  
            </div>
   
            {livreurData?.verified ? (
  <>
    <button
      onClick={() =>
        accepterCommande(selectedCommande._id, fetchCommandesDisponibles, setSelectedCommande)
      }
      className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
    >
      Accepter la commande
    </button>

    <a
      href={`http://localhost:5000/api/livreurs/orders/download-pdf/${livreurId}?acheteurId=${selectedCommande?.acheteurId}`}
      target="_blank"
      className="bg-orange-500 text-white px-4 py-2 rounded mt-2 inline-block"
    >
      Télécharger PDF
    </a>
  </>
) : null}


                    

          </div>
        </div>
      </main>
    </div>
    </div>
    </div>
  );
};

export default LivreurDashboard;
