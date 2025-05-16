import { createContext, useState, useEffect } from "react";

const UserContext = createContext(null); // Créer `UserContext`

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // État pour stocker les données de l'utilisateur

  // يبقى connecté  حتى بعد ما يعمل reload للصفحة
  useEffect(() => {
    const storedUser = localStorage.getItem("user");//return string
    if (storedUser) {
      setUser(JSON.parse(storedUser));//return objet (key : value)
    }
  }, []);

  // Fonction de connexion
  const login = (userData) => {
    setUser(userData); // Mettre à jour l'état
    localStorage.setItem("user", JSON.stringify(userData)); // Stocker les données dans localStorage
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null); // réinitialiser l'état
    localStorage.removeItem("user"); // supprimer les données de localStorage
  };

  return (//provider = fornisseur 
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 