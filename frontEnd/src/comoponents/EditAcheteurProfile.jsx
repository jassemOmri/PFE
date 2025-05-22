import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Swal from "sweetalert2";
import { FaMapMarkerAlt, FaSave, FaPowerOff, FaPhone, FaCalendarAlt, FaImage } from "react-icons/fa";

const EditAcheteurProfile = () => {
  
const [gpsStatus, setGpsStatus] = useState("");
  const [imProfile, setImProfile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");

  const { user } = useContext(UserContext);
const [formData, setFormData] = useState({
  numTele: "",
  addPostale: {
    rue: "",
    ville: "",
    region: "",
    pays: "",
    codePostal: "",
  },
  lat: null,
  lng: null,
});

const getMyLocation = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({ ...prev, lat, lng }));
        setGpsStatus(" Position détectée !");
      },
      (error) => {
        setGpsStatus("Impossible de récupérer la position.");
        console.error("Erreur GPS:", error);
      }
    );
  } else {
    setGpsStatus("La géolocalisation n'est pas supportée.");
  }
};

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/acheteur/profile/${user.userId}`);
        const u = res.data.user;
              setFormData({
            numTele: u.numTele || "",
            dateNaissance: u.dateNaissance ? u.dateNaissance.substring(0, 10) : "",
            addPostale: u.addPostale || {},
            lat: u.lat || null,
            lng: u.lng || null,
          });

        setImagePreview(`/uploads/${u.imProfile}`);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImProfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Vérification avant envoi
  const { numTele, addPostale, lat, lng } = formData;
  if (
    !numTele ||
    !addPostale.rue ||
    !addPostale.ville ||
    !addPostale.region ||
    !addPostale.pays ||
    !addPostale.codePostal ||
    !lat ||
    !lng
  ) {
    Swal.fire({
      icon: "warning",
      title: "Champs manquants",
      text: "Veuillez remplir toutes les informations obligatoires y compris votre position GPS.",
    });
    return;
  }

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("numTele", numTele);
    formDataToSend.append("dateNaissance", formData.dateNaissance);
    formDataToSend.append("addPostale", JSON.stringify(addPostale));
    formDataToSend.append("lat", lat);
    formDataToSend.append("lng", lng);

    if (imProfile) formDataToSend.append("imProfile", imProfile);

    await axios.put(
      `http://localhost:5000/acheteur/profile/${user.userId}`,
      formDataToSend,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // ✅ Succès : alert + redirection
    Swal.fire({
      icon: "success",
      title: "Succès",
      text: "Votre profil a été mis à jour avec succès !",
      confirmButtonText: "Aller au panier",
    }).then(() => {
      window.location.href = "/cart"; // ✅ Redirection vers la page commande
    });
  } catch (error) {
    console.error("Erreur update:", error);
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: "Échec de la mise à jour du profil. Veuillez réessayer.",
    });
  }
};
const handleDeactivate = async () => {
  const result = await Swal.fire({
    title: "Confirmation de désactivation",
    input: "password",
    inputLabel: "Entrez votre mot de passe pour confirmer",
    inputPlaceholder: "Mot de passe",
    inputAttributes: {
      autocapitalize: "off",
      autocorrect: "off"
    },
    showCancelButton: true,
    confirmButtonText: "Confirmer",
    cancelButtonText: "Annuler",
    preConfirm: async (password) => {
      if (!password) {
        Swal.showValidationMessage("Mot de passe requis");
        return false;
      }

      try {
        const res = await axios.put(`http://localhost:5000/api/users/desactiver/${user.userId}`, { password });
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || "Erreur inconnue";
        Swal.showValidationMessage(msg);
        return false;
      }
    }
  });

  if (result.isConfirmed) {
    //  Suppression du token et redirection
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    await Swal.fire("✅ Désactivé", result.value.message, "success");
    window.location.href = "/login";
  }
};


return (
<div className="max-w-6xl mx-auto bg-gray-50 p-6 rounded-2xl shadow-lg mt-10">
  <h2 className="text-4xl font-bold text-gray-800 mb-10 border-b pb-4 flex items-center gap-3">
    <FaImage className="text-green-600" />
    Modifier mon profil
  </h2>

  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
    
    {/* Colonne gauche */}
    <div className="col-span-2 space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          <FaPhone /> Téléphone
        </label>
        <input
          name="numTele"
          value={formData.numTele}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
          <FaImage /> Image de profil
        </label>
        <div className="flex items-center gap-4">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Aperçu"
              className="w-20 h-20 rounded-full border-2 border-green-400 shadow-md object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-gray-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-2">
          <FaCalendarAlt /> Date de naissance
        </label>
        <input
          name="dateNaissance"
          type="date"
          value={formData.dateNaissance}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm"
        />
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Adresse postale :</h3>
        {Object.keys(formData.addPostale).map((key) => (
          <input
            key={key}
            name={`addPostale.${key}`}
            value={formData.addPostale[key]}
            onChange={handleChange}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          />
        ))}
      </div>
    </div>

    {/* Colonne droite */}
    <div className="space-y-6 bg-white rounded-xl p-4 shadow-lg">
      <button
        onClick={getMyLocation}
        type="button"
        className="w-full flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-sky-600 text-white font-semibold shadow hover:bg-sky-700 transition"
      >
        <FaMapMarkerAlt />
        Détecter ma position
      </button>

      <p className="text-sm text-gray-600">{gpsStatus}</p>

      {formData.lat && formData.lng && (
        <>
          <MapContainer
            center={[formData.lat, formData.lng]}
            zoom={13}
            className="rounded-lg w-full h-[200px]"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[formData.lat, formData.lng]}>
              <Popup>Votre position</Popup>
            </Marker>
          </MapContainer>
          <p className="text-xs text-gray-500 mt-1">
            Latitude: {formData.lat.toFixed(5)} | Longitude: {formData.lng.toFixed(5)}
          </p>
        </>
      )}

      <div className="flex flex-col gap-4 pt-4">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
        >
          <FaSave />
          Sauvegarder
        </button>
        <button
          type="button"
          onClick={handleDeactivate}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
        >
          <FaPowerOff />
          Désactiver mon compte
        </button>
      </div>
    </div>
  </form>
</div>

);

};

export default EditAcheteurProfile;