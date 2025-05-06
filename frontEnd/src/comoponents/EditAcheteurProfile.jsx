import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Swal from "sweetalert2";

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

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
      <h2 className="text-3xl font-bold text-green-600 mb-6">Modifier mon profil</h2>
      {message && <p className="text-center text-blue-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input
            name="numTele"
            value={formData.numTele}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image de profil</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Aperçu"
              className="mt-2 w-24 h-24 object-cover rounded-full border border-gray-300"
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
          {Object.keys(formData.addPostale).map((key) => (
            <input
              key={key}
              name={`addPostale.${key}`}
              value={formData.addPostale[key]}
              onChange={handleChange}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg"
            />
          ))}
        </div>
<div className="mt-6">
  <button
    onClick={getMyLocation}
    className="flex items-center gap-2 px-5 py-2 rounded-full bg-sky-600 text-white font-semibold shadow hover:bg-sky-950 transition"
  >
   Détecter ma position
  </button>

  <p className="text-sm text-gray-600 mt-2">{gpsStatus}</p>

  {formData.lat && formData.lng && (
    <>
      <MapContainer
        center={[formData.lat, formData.lng]}
        zoom={13}
        className="rounded-md w-full h-[300px] mt-4"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[formData.lat, formData.lng]}>
          <Popup>Votre position</Popup>
        </Marker>
      </MapContainer>
      <p className="text-sm text-gray-500 mt-2">
        Latitude: {formData.lat.toFixed(5)} | Longitude: {formData.lng.toFixed(5)}
      </p>
    </>
  )}
</div>
        
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

export default EditAcheteurProfile;