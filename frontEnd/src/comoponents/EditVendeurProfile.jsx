import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import UserContext from "../context/UserContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { FaMapMarkerAlt, FaSave, FaPowerOff, FaPhone, FaCalendarAlt, FaImage } from "react-icons/fa";

const EditVendeurProfile = () => {
  const navigate = useNavigate();
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

  const [imProfile, setImProfile] = useState(null);
  const [imCin, setImCin] = useState(null);
  const [imagePreview, setImagePreview] = useState({});
  const [message, setMessage] = useState("");
  const [gpsStatus, setGpsStatus] = useState("");

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
          console.error(error);
        }
      );
    } else {
      setGpsStatus("La géolocalisation n'est pas supportée.");
    }
  };

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/vendeur/profile/${user.userId}`);
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
    <div className="max-w-6xl mx-auto bg-gray-50 p-6 rounded-2xl shadow-lg mt-10">
      <h2 className="text-4xl font-bold text-gray-800 mb-10 border-b pb-4 flex items-center gap-3">
        <FaImage className="text-green-600" />
        Modifier mon profil
      </h2>

      {message && <p className="text-center text-blue-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              {imagePreview.imProfile && (
                <img
                  src={imagePreview.imProfile}
                  alt="Aperçu profil"
                  className="w-20 h-20 rounded-full border-2 border-green-400 shadow-md object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "imProfile")}
                className="text-sm text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-2">
              <FaImage /> Image CIN
            </label>
            <div className="flex items-center gap-4">
              {imagePreview.imCin && (
                <img
                  src={imagePreview.imCin}
                  alt="Aperçu CIN"
                  className="w-32 h-20 object-cover border border-gray-300 rounded"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "imCin")}
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
            {["rue", "ville", "region", "pays", "codePostal"].map((field) => (
              <input
                key={field}
                name={`addPostale.${field}`}
                value={formData.addPostale[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            ))}
          </div>
        </div>

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
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVendeurProfile;
