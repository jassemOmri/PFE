import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, PackageCheck, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "./ui/button";
import MapComponent from "../comoponents/ui/MapComponent"
import MapTest from "../comoponents/ui/MapTest"

const LivreurDashboard = () => {
  const [disponible, setDisponible] = useState(false);
  const [commandesDisponibles, setCommandesDisponibles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const livreurId = user?.role === "livreur" ? user.userId : null;

  useEffect(() => {
    const fetchDisponibilite = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/livreurs/${livreurId}`);
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
      const res = await axios.put(`http://localhost:5000/api/livreurs/disponible/${livreurId}`, {
        disponible: !disponible,
      });
      setDisponible(res.data?.disponible || false);
    } catch (err) {
      console.error("Erreur lors du changement de disponibilité", err);
    }
  };

  return (
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
          <Button
            onClick={toggleDisponibilite}
            className={`px-6 py-2 rounded-full text-white font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105 ${
              disponible ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {disponible ? "✅ Disponible pour livraison" : "🚫 Indisponible"}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Liste des commandes */}
          <div className="col-span-1">
            <h3 className="text-xl font-semibold mb-4">Commandes Disponibles</h3>
            <div className="space-y-4">
              {commandesDisponibles.length === 0 ? (
                <p className="text-gray-500">Aucune commande disponible pour l’instant.</p>
              ) : (
                commandesDisponibles.map((cmd) => (
                  <div key={cmd._id} className="bg-white rounded shadow p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">Commande de {cmd.clientName}</p>
                        <p className="text-sm text-gray-500">État: {cmd.status}</p>
                      </div>
                      <Button>Voir</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Carte */}
          <div className="col-span-2 bg-white rounded shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Carte de Livraison</h3>
            <div className="h-[400px] bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500"><MapTest /></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LivreurDashboard;
