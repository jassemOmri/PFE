import { createContext, useState, useEffect } from "react";

const UserContext = createContext(null); // Créer `UserContext`

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // État pour stocker les données de l'utilisateur

  // Au chargement du composant, récupérer l'utilisateur depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Mettre à jour l'état avec les données de l'utilisateur
    }
  }, []);

  // Fonction de connexion
  const login = (userData) => {
    setUser(userData); // Mettre à jour l'état
    localStorage.setItem("user", JSON.stringify(userData)); // Stocker les données dans localStorage
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null); // Réinitialiser l'état
    localStorage.removeItem("user"); // Supprimer les données de localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; // Exporter `UserContext`