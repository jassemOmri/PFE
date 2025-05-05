import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const clientIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const vendeurIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});


const MapComponent = ({ client, vendeur }) => {
  if (!client || !vendeur) return null;

  const center = [
    (client.lat + vendeur.lat) / 2,
    (client.lng + vendeur.lng) / 2,
  ];

  return (
    <MapContainer center={center} zoom={8} scrollWheelZoom={true} className="h-[400px] w-full rounded-md shadow-md z-10">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[client.lat, client.lng]} icon={clientIcon}>
        <Popup>Client</Popup>
      </Marker>

      <Marker position={[vendeur.lat, vendeur.lng]} icon={vendeurIcon}>
        <Popup>Vendeur</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
