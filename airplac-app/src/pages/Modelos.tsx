import React, { useState, useEffect } from "react";
import axios from "axios";
import NuevoModelo from "../componets/NuevoModelo";
import { API_BASE_URL } from "../config";

interface Modelo {
  _id: string;
  producto: string;
  modelo: string;
  ancho: string;
  alto: string;
  tipo: string;
  placas_por_metro: number; // <-- Agregamos la propiedad
}

const Modelos = () => {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<Modelo | null>(null);

  useEffect(() => {
    const fetchModelos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/modelos/`);
        setModelos(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los modelos.");
        setLoading(false);
      }
    };

    fetchModelos();
  }, []);

  const handleEdit = (modelo: Modelo) => {
    setSelectedModelo(modelo);
    setIsModalOpen(true);
  };

  const nuevoModelo = () => {
    setSelectedModelo({
      _id: "",
      producto: "",
      modelo: "",
      ancho: "",
      alto: "",
      tipo: "",
      placas_por_metro: 1, // Valor inicial
    });
    setIsModalOpen(true);
  };

  const handleSave = async (modelo: Modelo) => {
    try {
      if (modelo._id) {
        // Editar modelo existente
        await axios.put(`${API_BASE_URL}/modelos/${modelo._id}`, modelo);
      } else {
        // Crear nuevo modelo
        await axios.post(`${API_BASE_URL}/modelos/`, modelo);
      }
      setIsModalOpen(false);
      setSelectedModelo(null);

      // Refrescar lista
      const response = await axios.get(`${API_BASE_URL}/modelos/`);
      setModelos(response.data);
    } catch (err) {
      console.error("Error al guardar el modelo:", err);
    }
  };

  if (loading) {
    return <p>Cargando modelos...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <button className="btn btn-outline mb-4" onClick={() => nuevoModelo()}>
        Nuevo modelo
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {modelos.map((modelo) => (
          <div key={modelo._id} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={
                  "https://e7.pngegg.com/pngimages/785/310/png-clipart-carrying-boxes-cartoon-pattern-material-city-delivery-door-comics-angle-thumbnail.png"
                }
                alt={modelo.modelo}
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-lg md:text-xl">{modelo.modelo}</h2>
              <p className="text-sm text-gray-600">
                <strong>Producto:</strong> {modelo.producto}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Dimensiones:</strong> {modelo.ancho} x {modelo.alto}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tipo:</strong> {modelo.tipo}
              </p>
              {/* Nuevo campo para mostrar */}
              <p className="text-sm text-gray-600">
                <strong>Placas por metro:</strong> {modelo.placas_por_metro}
              </p>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary btn-sm md:btn-md"
                  onClick={() => handleEdit(modelo)}
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NuevoModelo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modelo={selectedModelo}
        onSave={handleSave}
      />
    </div>
  );
};

export default Modelos;
