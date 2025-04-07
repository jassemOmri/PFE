import React, { useState, useEffect,useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaFacebook, FaInstagram, FaWhatsapp, FaFacebookMessenger } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
    const { user } = useContext(UserContext); 
const navigate = useNavigate();
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur de chargement du produit:", error);
        setLoading(false);
      });
  }, [id]);

  // Fonction pour ajouter un produit au panier
  const addToCart = async (product) => {
    console.log(user)
    if (!user || !user.userId || user.role !== "acheteur") {
      alert("Veuillez vous connecter pour ajouter des produits au panier !");
      return;
    }

    const payload = {
      acheteurId: user.userId,
      productId: product._id,
      quantity: quantity, // Utilisez la quantité sélectionnée
    };

    try {
      await axios.post("http://localhost:5000/api/cart/add", payload);
      alert("Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      alert("Erreur lors de l'ajout au panier !");
    }
  };

    // Rediriger vers la page de paiement en ligne
   const handleOnlinePayment = () => {
    const productTotal = product.price * quantity; // Calculer le total en fonction de la quantité
    navigate("/payment", { state: { productTotal, source: "product" } }); // Passer productTotal et la source
  };
  // Fonction pour partager sur les réseaux sociaux
  const handleShare = (platform) => {
    const url = window.location.href;
    const message = `Découvrez ce produit: ${product.name} - ${url}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'instagram':
        // Instagram ne supporte pas le partage direct, rediriger vers l'application
        window.open(`https://www.instagram.com/`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${message}`, '_blank');
        break;
      case 'messenger':
        window.open(`fb-messenger://share/?link=${url}`, '_blank');
        break;
      default:
        break;
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (!product) return <div className="text-center py-8">Produit non trouvé</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg mt-10">
        {/* Image */}
        <div className="flex flex-col items-center">
          <img
            src={`http://localhost:5000/uploads/${product.image}`}
            alt={product.name}
            className="w-full max-w-md rounded-lg shadow-md"
          />
        </div>

        {/* Détails */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-700 mt-2">{product.description}</p>

          {/* Prix */}
          <div className="text-2xl font-bold text-red-600 mt-4">{product.price} TND</div>

          {/* Quantité */}
          <div className="mt-4">
            <label htmlFor="quantity" className="text-gray-600">Quantité:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              min="1"
              className="ml-2 p-2 border rounded w-16"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Boutons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button   onClick={handleOnlinePayment}
            
             className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
             >
              Acheter maintenant
            </button>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={() => addToCart(product)}
            >
              Ajouter au panier
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Sauvegarder
            </button>
          </div>

          {/* Partage */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => handleShare('facebook')}
              className="text-blue-600 text-2xl hover:text-blue-700"
            >
              <FaFacebook />
            </button>
            <button
              onClick={() => handleShare('instagram')}
              className="text-pink-500 text-2xl hover:text-pink-600"
            >
              <FaInstagram />
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="text-green-500 text-2xl hover:text-green-600"
            >
              <FaWhatsapp />
            </button>
            <button
              onClick={() => handleShare('messenger')}
              className="text-blue-400 text-2xl hover:text-blue-500"
            >
              <FaFacebookMessenger />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;