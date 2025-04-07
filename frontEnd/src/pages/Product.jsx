import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/products/${id}`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement du produit:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!product) return <p>Produit non trouvé</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <img src={`http://localhost:5000/uploads/${product.image}`} alt={product.name} />
      <p>{product.description}</p>
      <p>Prix: ${product.price}</p>
    </div>
  );
};

export default Product;