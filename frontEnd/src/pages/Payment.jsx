import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Payment = () => {
  const [deliveryMethod, setDeliveryMethod] = useState("livraison");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const navigate = useNavigate();

 // Récupérer les données passées depuis Cart.jsx ou ProductDetails.jsx
  const location = useLocation();
  const { cartTotal, productTotal, source } = location.state || {
    cartTotal: 0,
    productTotal: 0,
    source: null,
  };

  // Déterminer le sous-total en fonction de la source
  const subtotal = source === "cart" ? cartTotal : productTotal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Veuillez accepter les termes et conditions.");
      return;
    }
    alert("Paiement réussi !");
    navigate("/"); // Rediriger vers la page d'accueil
  };

  const applyDiscount = () => {
    if (discountCode === "REMISE20") {
      setDiscountApplied(true);
      alert("Code de réduction appliqué !");
    } else {
      alert("Code de réduction invalide.");
    }
  };

  const shipping = 5.0; // Frais de livraison
  const discount = discountApplied ? 20.0 : 0.0; // Réduction appliquée
  const total = subtotal + shipping - discount; // Total à payer

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Paiement</h2>

          {/* Informations de livraison */}
          <div className="mb-8">
           

            <form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse e-mail *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Pays *
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    Région
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  J'ai lu et j'accepte les termes et conditions.
                </label>
              </div>
            </form>
          </div>

          {/* Récapitulatif du panier */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Récapitulatif de la commande</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Sous-total</span>
                <span className="text-gray-700">{subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Frais de livraison</span>
                <span className="text-gray-700">5,00 €</span>
              </div>
             
              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

        

          {/* Bouton de paiement */}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-400 transition"
          >
            Payer maintenant
          </button>

          {/* Sécurité */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <span className="mr-2">🔒</span> Paiement sécurisé 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;