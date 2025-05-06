import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../comoponents/UserNavbar"
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartTotal = 0, productTotal = 0, source } = location.state || {};
const subtotal = parseFloat(source === "product" ? location.state?.productTotal : location.state?.cartTotal) || 0;


  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    cardName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.userId) {
        alert("Utilisateur non connecté.");
        return;
      }

      const paymentData = {
        acheteurId: user.userId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || "00000000",
        address: `${form.address}, ${form.city}, ${form.state}, ${form.zip}`,
        country: form.country,
        amount: subtotal,
        paymentMethod: "en ligne",
      };

      const res = await axios.post("http://localhost:5000/api/payment/confirm", paymentData);

      if (res.data.success) {
        alert("✅ Paiement enregistré avec succès !");
        navigate("/");
      } else {
        alert("Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      console.error("Erreur paiement:", error);
      alert("❌ Une erreur est survenue lors du paiement.");
    }
  };

  return (
    <div><UserNavbar/>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl bg-white p-10 rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* Billing Address */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Coordonnées</h2>
          <div className="space-y-4">
            <input type="text" name="fullName" placeholder="Nom Complet" value={form.fullName} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            <input type="text" name="address" placeholder="Adresse" value={form.address} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            <div className="flex gap-4">
              <input type="text" name="city" placeholder="Ville" value={form.city} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
              <input type="text" name="state" placeholder="Région" value={form.state} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            </div>
            <div className="flex gap-4">
              <input type="text" name="zip" placeholder="Code Postal" value={form.zip} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
              <input type="text" name="country" placeholder="Pays" value={form.country} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Paiement</h2>
          <div className="space-y-4">
            <input type="text" name="cardName" placeholder="Nom sur la carte" value={form.cardName} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            <input type="text" name="cardNumber" placeholder="Numéro de carte" value={form.cardNumber} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            <div className="flex gap-4">
              <input type="text" name="expMonth" placeholder="Mois" value={form.expMonth} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
              <input type="text" name="expYear" placeholder="Année" value={form.expYear} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
              <input type="text" name="cvv" placeholder="CVV" value={form.cvv} onChange={handleChange} className="w-full border rounded px-4 py-3 shadow-sm" required />
            </div>

            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Résumé</h3>
              <div className="flex justify-between text-gray-700">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-gray-700 mt-1">
                <span>Frais de livraison</span>
                <span>5.00 TND</span>
              </div>
              <div className="flex justify-between font-bold text-green-700 mt-2 border-t pt-2">
                <span>Total</span>
                <span>{(subtotal + 5).toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition">
            Confirmer le Paiement
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Payment;
