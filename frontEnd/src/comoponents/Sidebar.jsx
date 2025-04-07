import React from "react";
import { X } from "lucide-react";
import categories from "../data/categoriesData"; // ✅ Pas besoin des accolades
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  // Fonction appelée lorsqu'on clique sur une catégorie
  const handleCategoryClick = (categoryName) => {
    localStorage.setItem("selectedCategory", categoryName); // ✅ enregistrer
    navigate("/"); // ✅ aller vers page d'accueil
    onClose(); // ✅ fermer le menu après sélection
  };

  return (
    <>
      {/* Fond sombre derrière le menu */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
        />
      )}

      {/* Menu latéral (sidebar) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* En-tête de la sidebar */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-green-600">Catégories</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Liste des catégories */}
        <ul className="p-4 space-y-3">
          {/* Toutes les catégories */}
          <li>
            <button
              onClick={() => handleCategoryClick("all")}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-100 text-gray-700 hover:text-green-600 transition font-medium"
            >
              Toutes les catégories
            </button>
          </li>

          {/* Catégories dynamiques */}
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => handleCategoryClick(category.name)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-100 text-gray-700 hover:text-green-600 transition font-medium"
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
