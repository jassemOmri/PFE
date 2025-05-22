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

        setAllProducts(all); // stocke tout les produit
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

 
  const handleSearch = (searchTerm) => {
    if (searchTerm.trim() === "") { // if user entre rien fais ca 
      setFilteredProducts(
        selectedCategory === "all"// filter est un methode pour les tableau
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
  <Navbar onSearch={handleSearch} />

  <div className="min-h-screen flex flex-col justify-between bg-gray-50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 tracking-tight">
        {selectedCategory === "all"
          ? "Tous les produits"
          : `Produits : ${selectedCategory}`}
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Chargement...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">Aucun produit trouvé</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                onClick={() => navigate(`/product/${product._id}`)}
                className="cursor-pointer"
              >
                <img
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4">
                  <h4 className="text-base font-semibold text-gray-800 leading-tight truncate mb-1">
                    {product.name}
                  </h4>
                  <div className="text-sm font-medium">
                    {product.salePrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          {product.regularPrice} DT
                        </span>
                        <span className="text-green-600 font-bold">
                          {product.salePrice} DT
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-900">{product.regularPrice || 0} DT</span>
                    )}
                  </div>
                </div>
              </div>

              {user && user.role === "acheteur" && (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-400 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-b-xl transition"
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
