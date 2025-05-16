import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import Swal from "sweetalert2";

const QRCodeScanner = ({ onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const handleScanSuccess = async (decodedText) => {
      console.log("QR détecté :", decodedText);

      const orderId = extractOrderIdFromURL(decodedText);
      if (!orderId) {
        Swal.fire("Erreur", "QR code invalide", "error");
        return;
      }

      try {
        const response = await axios.put(`http://localhost:5000/api/orders/confirm-delivery/${orderId}`);
        Swal.fire("✅", "Commande livrée avec succès", "success");
        scanner.clear();
        onClose();
      } catch (error) {
        console.error("Erreur:", error);
        Swal.fire("Erreur", "Impossible de livrer la commande", "error");
      }
    };

    scanner.render(handleScanSuccess, (error) => {
      console.warn("Erreur de scan:", error);
    });

    return () => scanner.clear();
  }, [onClose]);

  const extractOrderIdFromURL = (url) => {
    const match = url.match(/\/livrer\/(.+)$/);
    return match ? match[1] : null;
  };
  

  return (
    <div className="p-4 border rounded shadow bg-white text-center">
      <h3 className="text-lg font-semibold mb-4">Scannez le QR Code</h3>
      <div id="qr-reader" style={{ width: "100%" }}></div>
      <button
        onClick={onClose}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Fermer
      </button>
    </div>
  );
};

export default QRCodeScanner;
