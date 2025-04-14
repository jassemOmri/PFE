import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import LivreurDashboard from "./comoponents/LivreurDashboard";
import AcheteurDashboard from "./comoponents/AcheteurDashboard";
import VendeurDashboard from "./comoponents/VendeurDashboard";
import ProductDetails from "./comoponents/ProductDetails";
import UserNavbar from "./comoponents/UserNavbar";
import Navbar from "./comoponents/Navbar";
import UserContext, { UserProvider } from "./context/UserContext";
import Payment from "./pages/Payment"; 
import AdminDashboard from "./comoponents/AdminDashboard"; // Importez le composant AdminDashboard
import VendeurCommandes from "./comoponents/VendeurCommandes";
import VendeurProfil from "./pages/VendeurProfil";
import AcheteurProfil from "./pages/AcheteurProfil";
import LivreurProfil from "./pages/LivreurProfil";

import EditVendeurProfile from "./comoponents/EditVendeurProfile";



const App = () => {
  const { user } = useContext(UserContext);

  // Fonction pour gérer la recherche
  const handleSearch = (searchTerm) => {
    console.log("Recherche:", searchTerm);
    // Ajoutez ici la logique pour gérer la recherche (par exemple, filtrer les produits)
  };

  return (
    <>
      {/* Passez la fonction handleSearch à Navbar */}
      {!user && <Navbar onSearch={handleSearch} />}

      
     
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
              <Route path="/productDetails" element={<ProductDetails />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/livreur-dashboard" element={<LivreurDashboard />} />
        <Route path="/acheteur-dashboard" element={<AcheteurDashboard />} />
        <Route path="/vendeur-dashboard" element={<VendeurDashboard />} />
        <Route path="/vendeur-commandes" element={<VendeurCommandes />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
         <Route path="/payment" element={<Payment />} />
         <Route path="/vendeur/:id" element={<VendeurProfil />} />
          <Route path="/livreur/:id" element={<LivreurProfil />} />
          <Route path="/acheteur/:id" element={<AcheteurProfil />} />
          <Route path="/vendeur/profile/edit" element={<EditVendeurProfile />} />

                 <Route path="/admin" element={<AdminDashboard />} /> {/* Route pour le tableau de bord admin */}

      </Routes>
      
    </>
  );
};

export default App;