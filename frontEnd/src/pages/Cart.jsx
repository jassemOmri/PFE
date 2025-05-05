import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { LocateFixed } from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
const [clientLat, setClientLat] = useState(null);
const [clientLng, setClientLng] = useState(null);
const [gpsStatus, setGpsStatus] = useState("");

useEffect(() => {
  let watcherId;

  if ("geolocation" in navigator) {
    watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setClientLat(latitude);
        setClientLng(longitude);
        setGpsStatus("📡 Position en direct activée");
      },
      async (error) => {
        console.warn("Erreur GPS :", error);
        setGpsStatus("⚠️ Erreur GPS, tentative avec IP...");

        // ⛑ fallback vers IP
        const res = await fetch("https://ipapi.co/json");
        const data = await res.json();
        setClientLat(data.latitude);
        setClientLng(data.longitude);
        setGpsStatus("🌐 Position IP approximative utilisée");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } else {
    setGpsStatus("🚫 La géolocalisation n'est pas supportée.");
  }

  return () => {
    if (watcherId) navigator.geolocation.clearWatch(watcherId);
  };
}, []);



  // 🔄 Charger le panier
  useEffect(() => {
    if (user?.userId) {
      axios
        .get(`http://localhost:5000/api/cart/${user.userId}`)
        .then((response) => setCart(response.data.products || []))
        .catch((error) => console.error("Erreur chargement panier:", error));
    }
  }, [user]);


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
      await axios.delete(`http://localhost:5000/api/cart/remove/${user.userId}/${productId}`);
      setCart(cart.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error("Erreur suppression produit:", error);
      alert("Erreur lors de la suppression du produit.");
    }
  };

  const handleOnlinePayment = () => {
    const cartTotal = calculateTotal();
    navigate("/payment", { state: { cartTotal, source: "cart" } });
  };

  const handleDeliveryPayment = async () => {
    if (!cart.length) {
      alert("Votre panier est vide !");
      return;
    }

    const orderData = {
      acheteurId: user.userId?.trim(),
      paymentMethod: "à la livraison",

      clientLat,
      clientLng,

      clientName: user?.name || "Nom inconnu",
      products: cart.map((product) => ({
        productId: product.productId?.trim(),
        productName: product.name,
        quantity: Number(product.quantity) || 1,
        price: Number(product.salePrice || product.regularPrice || product.price) || 0,
        vendeurId: product.vendeurId?.trim() || "",
        status: { type: String, default: "en attente" },
      })),
    };

    try {
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
                    <div className="mb-4">
<div className="mb-6">
 <p className="text-sm text-gray-600 mt-2">{gpsStatus}</p>

 
</div>

  <p className="text-sm mt-2 text-gray-600">{gpsStatus}</p>
</div>
{clientLat && clientLng && (
  <MapContainer
    center={[clientLat, clientLng]}
    zoom={12}
    className="rounded-md w-full h-[250px] mt-4"
  >
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[clientLat, clientLng]}>
      <Popup>Votre position</Popup>
    </Marker>
  </MapContainer>
)}
<p className="text-sm text-red-500">
  Latitude: {clientLat} | Longitude: {clientLng}
</p>
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
