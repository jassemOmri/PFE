// MapComponent.jsx
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const MapComponent = ({ client, vendeur }) => {
  const position = [client.lat, client.lng];
  const vendeurPos = [vendeur.lat, vendeur.lng];
  const polyline = [position, vendeurPos];

  return (
    <MapContainer center={position} zoom={13} className="w-full h-[400px] rounded">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>Client</Popup>
      </Marker>
      <Marker position={vendeurPos}>
        <Popup>Vendeur</Popup>
      </Marker>
      <Polyline positions={polyline} color="blue" />
    </MapContainer>
  );
};

export default MapComponent;
