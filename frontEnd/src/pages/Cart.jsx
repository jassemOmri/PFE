import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom";




const Cart = () => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // 🔄 Charger le panier
  useEffect(() => {
    if (user?.userId) {
      axios
        .get(`http://localhost:5000/api/cart/${user.userId}`)
        .then((response) => setCart(response.data.products || []))
        .catch((error) => console.error("Erreur chargement panier:", error));
    }
  }, [user]);

// reduce : loop et collecte les resultat dans un tabeau
  const calculateTotal = () => {
    return cart.reduce((total, product) => {
      const price = parseFloat(product.price || 0);
      const quantity = parseInt(product.quantity || 1);
      return total + price * quantity;
    }, 0);
  };

  //  Supprimer un produit du panier
const handleRemoveProduct = async (productId) => {
  try {
    // supprimer côté backend aussi
    await axios.delete(`http://localhost:5000/api/cart/remove/${user.userId}/${productId}`);

    //  mettre à jour le state frontend
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    alert("Erreur lors de la suppression du produit.");
  }
};

 const handleOnlinePayment = async () => {
  if (!cart.length) {
    alert("Votre panier est vide !");
    return;
  }

  try {
    // ✅ Vérifier profil complet
    const res = await axios.get(`http://localhost:5000/acheteur/profile/${user.userId}`);
    const u = res.data.user;

    const hasIncompleteInfo =
      !u.numTele ||
      !u.addPostale?.rue ||
      !u.addPostale?.ville ||
      !u.addPostale?.region ||
      !u.addPostale?.pays ||
      !u.addPostale?.codePostal ||
      !u.lat ||
      !u.lng;

    if (hasIncompleteInfo) {
      alert("Veuillez compléter votre profil avant de passer commande.");
      navigate("/acheteur/profile/edit");
      return;
    }

    // ✅ Si tout est ok, calculer le total
    const cartTotal = calculateTotal();

    // ✅ Redirection vers l'interface paiement en ligne
    navigate("/payment", {
      state: {
        cartTotal,
        source: "cart",
      },
    });
  } catch (error) {
    console.error("Erreur vérification profil:", error);
    alert("Erreur lors de la vérification du profil.");
  }
};


  const handleDeliveryPayment = async () => {
  if (!cart.length) {
    alert("Votre panier est vide !");
    return;
  }

  try {
    // 🔎 الحصول على معلومات المشتري منذ قاعدة البيانات
    const res = await axios.get(`http://localhost:5000/acheteur/profile/${user.userId}`);
    const u = res.data.user;

    const hasIncompleteInfo =
      !u.numTele ||
      !u.addPostale?.rue ||
      !u.addPostale?.ville ||
      !u.addPostale?.region ||
      !u.addPostale?.pays ||
      !u.addPostale?.codePostal ||
      !u.lat ||
      !u.lng;

    if (hasIncompleteInfo) {
      alert("Veuillez compléter votre profil avant de passer commande.");
      navigate("/acheteur/profile/edit");
      return;
    }

    // ✅ Profil complet : envoi de commande
    const orderData = {
      acheteurId: user.userId?.trim(),
      paymentMethod: "à la livraison",
      clientLat: u.lat,
      clientLng: u.lng,
      clientName: u.name || "Nom inconnu",
      products: cart.map((product) => ({
        productId: product.productId?.trim(),
        productName: product.name,
        quantity: Number(product.quantity) || 1,
        price: Number(product.salePrice || product.regularPrice || product.price) || 0,
        vendeurId: product.vendeurId?.trim() || "",
        status: { type: String, default: "en attente" },
      })),
    };

    await axios.post("http://localhost:5000/api/cart/confirm", orderData);
    await axios.delete(`http://localhost:5000/api/cart/clear/${user.userId}`);
    setCart([]);
    alert("Commande confirmée !");
  } catch (error) {
    console.error("Erreur confirmation:", error);
    alert(error.response?.data?.message || "Erreur lors de la confirmation.");
  }
};


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Votre Panier</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">Votre panier est vide.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((product) => (
            <div key={product.productId} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                <p className="text-gray-600">
                  {parseFloat(product.price).toFixed(2)}dt x {product.quantity}
                </p>
              </div>
              <button
                onClick={() => handleRemoveProduct(product.productId)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
              >
                Supprimer
              </button>
            </div>
          ))}

          <div className="mt-6">
            <p className="text-xl font-bold text-gray-800">
              Total : {calculateTotal().toFixed(2)}dt
            </p>
          </div>

          <div className="mt-6 space-x-4">
                    

            <button
              onClick={handleOnlinePayment}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition"
            >
              Payer en ligne
            </button>

            <button
              onClick={handleDeliveryPayment}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition"
            >
              Payer à la livraison
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
