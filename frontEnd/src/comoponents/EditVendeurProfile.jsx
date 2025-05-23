import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const EditVendeurProfile = () => {
  const navigate = useNavigate(); // داخل الكومبوننت

  const { user } = useContext(UserContext);
const [formData, setFormData] = useState({
  numTele: "",
  dateNaissance: "",
  lat: null,
  lng: null,
  addPostale: {
    rue: "",
    ville: "",
    region: "",
    pays: "",
    codePostal: "",
  },
});
const getMyLocation = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log("📍 Vendeur position:", lat, lng);
        setFormData((prev) => ({ ...prev, lat, lng }));
      },
      (error) => {
        alert("❌ Impossible de récupérer la position.");
        console.error(error);
      }
    );
  } else {
    alert("⚠️ La géolocalisation n'est pas supportée.");
  }
};



  const [imProfile, setImProfile] = useState(null);
  const [imCin, setImCin] = useState(null);
  const [imagePreview, setImagePreview] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/vendeur/profile/${user.userId}`);
        console.log("res",res.data)
        const { user: u, vendeur } = res.data;
        setFormData({
          numTele: u.numTele || "",
          dateNaissance: u.dateNaissance ? u.dateNaissance.substring(0, 10) : "",
          addPostale: u.addPostale || {},
           lat: vendeur.lat || null,
            lng: vendeur.lng || null,
        });
        setImagePreview({
          imProfile: `/uploads/${u.imProfile}`,
          imCin: `/uploads/${vendeur.imCin}`,
        });
      } catch (error) {
        console.error("Erreur chargement données:", error);
      }
    };

    if (user?.userId) fetchCurrentData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("addPostale.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        addPostale: { ...prev.addPostale, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === "imProfile") setImProfile(file);
      if (field === "imCin") setImCin(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("numTele", formData.numTele);
      formDataToSend.append("dateNaissance", formData.dateNaissance);

      formDataToSend.append("addPostale", JSON.stringify(formData.addPostale));
        formDataToSend.append("lat", formData.lat);
        formDataToSend.append("lng", formData.lng);

      if (imProfile) formDataToSend.append("imProfile", imProfile);
      if (imCin) formDataToSend.append("imCin", imCin);

      await axios.put(
        `http://localhost:5000/vendeur/profile/${user.userId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
        Swal.fire({
          icon: "success",
          title: "✅ Profil mis à jour !",
          text: "Merci d'avoir complété votre profil. Bonne vente et beaucoup de succès !",
          confirmButtonText: "Aller au tableau vendeur",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/vendeur-dashboard");
          }
        });

    } catch (error) {
      console.error("Erreur update:", error);
      setMessage("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-green-600 mb-6">Modifier mon profil</h2>
      {message && <p className="text-center text-blue-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            name="numTele"
            value={formData.numTele}
            onChange={handleChange}
            placeholder="Téléphone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image de profil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "imProfile")}
            className="block"
          />
          {imagePreview.imProfile && (
            <img
              src={imagePreview.imProfile}
              
              alt="Aperçu profil"
              className="mt-2 w-24 h-24 object-cover rounded-full border border-gray-300"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image CIN</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "imCin")}
            className="block"
          />
          {imagePreview.imCin && (
            <img
              src={imagePreview.imCin}
              alt="Aperçu CIN"
              className="mt-2 w-32 h-20 object-cover border border-gray-300 rounded"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
          <input
            name="dateNaissance"
            type="date"
            value={formData.dateNaissance}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Adresse postale :</h3>
          {["rue", "ville", "region", "pays", "codePostal"].map((field) => (
            <input
              key={field}
              name={`addPostale.${field}`}
              value={formData.addPostale[field]}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg"
            />
          ))}
        </div>


                  <button
            type="button"
            onClick={getMyLocation}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-500 transition"
          >
            📍 Définir ma position actuelle
          </button>

          {formData.lat && formData.lng && (
            <p className="text-sm text-gray-600 mt-2">
              Position actuelle: {formData.lat.toFixed(5)} / {formData.lng.toFixed(5)}
            </p>
          )}


        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-500 transition"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default EditVendeurProfile;
