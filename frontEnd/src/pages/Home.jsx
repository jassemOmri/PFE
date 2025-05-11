import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../comoponents/Footer";
import Navbar from "../comoponents/Navbar";
import UserContext from "../context/UserContext";

const Home = () => {
  //const [valeur, setValeur] = useState(valeurInitiale);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useContext(UserContext);
/* exemple
const user = { nom: "Ali", age: 30 };
sauvegarder :JSON.stringify
localStorage.setItem("user", JSON.stringify(user));
lire :JSON.parse
const u = JSON.parse(localStorage.getItem("user"));
 */
  // Récupérer la catégorie sélectionnée depuis localStorage syntax :localStorage.getItem("clé")
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";

  // Chargement initial des produits avec filtrage par catégorie
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        const all = response.data;

        setAllProducts(all); // stocke tout
        if (selectedCategory === "all") {
          setFilteredProducts(all);
        } else {
          //syntaxe :let nouveauTableau = tableauOriginal.filter((element) => condition);
          const filtered = all.filter(
            (product) => product.category === selectedCategory
          );
          setFilteredProducts(filtered);
        }
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des produits:", error)
      )
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // 🔍 Filtrage en temps réel (barre de recherche)
  const handleSearch = (searchTerm) => {
    if (searchTerm.trim() === "") { // if user entre rien fais ca 
      setFilteredProducts(
        selectedCategory === "all"
          ? allProducts : allProducts.filter((product) => product.category === selectedCategory)
      );
    } else { // sinon fais ca
      /// syntaxe filter + recherche insensible à la casse
//array.filter((element) =>
  //element.propriete.toLowerCase().includes(motRecherche.toLowerCase())
//);
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())//includes : true | false
      );
      // filtre croisé avec la catégorie
      const result =
        selectedCategory === "all"
          ? filtered
          : filtered.filter((p) => p.category === selectedCategory);
      setFilteredProducts(result);
    }
  };

  //Ajouter au panier
  const addToCart = async (product) => {
    if (!user || !user.userId || user.role !== "acheteur") {
      alert("Veuillez vous connecter comme acheteur !");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/cart/add", {
        acheteurId: user.userId,
        productId: product._id,
        quantity: 1,
      });
      alert("Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      alert("Erreur lors de l'ajout au panier !");
    }
  };

  return (
    <div>
      {/* 🔎 Navbar avec fonction de recherche */}
      <Navbar onSearch={handleSearch} />

      <div className="min-h-screen flex flex-col justify-between">
        <div className="container mx-auto p-8 flex-1">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {/*Syntaxe condition ? valeur_si_vrai : valeur_si_faux*/}
            {selectedCategory === "all"
              ? "Tous les produits"
              : `Produits : ${selectedCategory}`}
          </h2>

          {/*  Affichage des produits */}
          {loading ? (
            <p className="text-center text-gray-500">Chargement...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500">Aucun produit trouvé</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-lg p-4 hover:shadow-2xl transition duration-300"
                >
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="cursor-pointer"
                  >
                    <img
                      src={`http://localhost:5000/uploads/${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                    <h4 className="text-lg font-semibold mb-1 text-gray-900">
                      {product.name}
                    </h4>
                    <div className="font-semibold text-gray-900">
                              {product.salePrice
                                ? (
                                  <>
                                    <span className="line-through text-sm text-gray-400 mr-2">
                                      {product.regularPrice} DT
                                    </span>
                                    <span className="text-green-600 font-bold">
                                      {product.salePrice} DT
                                    </span>
                                  </>
                                )
                                : (
                                  <span>{product.regularPrice || 0} DT</span>
                                )
                              }
                                  </div>

                  </div>

                  {/* Bouton pour acheteur uniquement */}
                  {user && user.role === "acheteur" && (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition"
                    >
                      Ajouter au panier
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
