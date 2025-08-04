import React, { useState, useEffect } from "react";
import axios from "axios";
import NuevoModelo from "../componets/NuevoModelo";
import NuevoStock from "../componets/NuevoStock";
import ModeloStockCreatedModal from "../componets/ModeloStockCreatedModal";
import { API_BASE_URL } from "../config";

interface Modelo {
  _id: string;
  producto: string;
  modelo: string;
  ancho: string;
  alto: string;
  tipo: string;
  placas_por_metro: number;
  fecha_creacion?: string;
}

interface Stock {
  _id: string;
  producto: string;
  modelo: string;
  idModelo?: string;
  stock: number | undefined;
  unidad: string;
  produccion_diaria: number | undefined;
  valor: number | undefined;
  promo1: number | undefined;
  promo2: number | undefined;
  promo3: number | undefined;
  precio: number | undefined;
  precio_promo1: number | undefined;
  precio_promo2: number | undefined;
  precio_promo3: number | undefined;
  stockActivo: boolean;
  porcentaje_ganancia: number | undefined;
  porcentaje_tarjeta: number | undefined;
  total_redondeo: number | undefined;
}

interface BackendResponse {
  message: string;
  modelo: Modelo;
  stock: Stock;
}

const Modelos = () => {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<Modelo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para el modal de confirmación
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const [createdModelo, setCreatedModelo] = useState<Modelo | null>(null);
  const [createdStock, setCreatedStock] = useState<Stock | null>(null);

  // Estados para el modal de configuración de stock
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockForEdit, setSelectedStockForEdit] =
    useState<Stock | null>(null);

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
      placas_por_metro: 1,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (modelo: Modelo) => {
    try {
      if (modelo._id) {
        // Editar modelo existente
        await axios.put(`${API_BASE_URL}/modelos/${modelo._id}`, modelo);
        setIsModalOpen(false);
        setSelectedModelo(null);

        // Refrescar lista
        const response = await axios.get(`${API_BASE_URL}/modelos/`);
        setModelos(response.data);
      } else {
        // Crear nuevo modelo - ahora esperamos la nueva respuesta
        const response = await axios.post<BackendResponse>(
          `${API_BASE_URL}/modelos/`,
          modelo
        );

        // Guardar los datos de la respuesta
        console.log(response.data);
        setCreatedModelo(response.data.modelo);
        setCreatedStock(response.data.stock);

        // Cerrar modal de creación
        setIsModalOpen(false);
        setSelectedModelo(null);

        // Mostrar modal de confirmación
        setShowCreatedModal(true);

        // Refrescar lista de modelos
        const modelosResponse = await axios.get(`${API_BASE_URL}/modelos/`);
        setModelos(modelosResponse.data);
      }
    } catch (err) {
      console.error("Error al guardar el modelo:", err);
      setError("Error al guardar el modelo.");
    }
  };

  const handleGoToStockConfig = () => {
    // Cerrar modal de confirmación
    setShowCreatedModal(false);

    // Abrir modal de configuración de stock con el stock creado
    if (createdStock) {
      setSelectedStockForEdit(createdStock);
      setIsStockModalOpen(true);
    }
  };

  const handleCloseCreatedModal = () => {
    setShowCreatedModal(false);
    setCreatedModelo(null);
    setCreatedStock(null);
  };

  const handleStockSave = async (stock: Stock) => {
    try {
      if (stock._id) {
        await axios.put(`${API_BASE_URL}/productos/stock/${stock._id}`, stock);
      } else {
        await axios.post(`${API_BASE_URL}/productos/stock/`, stock);
      }

      setIsStockModalOpen(false);
      setSelectedStockForEdit(null);

      // Mostrar mensaje de éxito
      console.log("Stock configurado exitosamente");
    } catch (err) {
      console.error("Error al guardar el stock:", err);
    }
  };

  // Filtrar modelos basado en el término de búsqueda
  const filteredModelos = modelos.filter(
    (modelo) =>
      modelo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <span className="text-lg text-base-content">Cargando modelos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header con estadísticas y búsqueda */}
      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-primary to-primary-focus px-6 py-4 flex justify-between items-center">
          <h2 className="text-primary-content text-xl font-semibold flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Gestión de Modelos
          </h2>
          <div className="flex items-center gap-4">
            {/* Estadísticas */}
            <div className="hidden md:flex items-center gap-6 text-primary-content/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm font-medium">
                  {modelos.length} Modelos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-info rounded-full"></div>
                <span className="text-sm font-medium">
                  {filteredModelos.length} Filtrados
                </span>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="join">
              <input
                type="text"
                placeholder="Buscar modelos..."
                className="input input-bordered join-item w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="btn btn-square join-item"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Botón Nuevo Modelo */}
            <button className="btn btn-primary btn-sm" onClick={nuevoModelo}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Nuevo Modelo
            </button>
          </div>
        </div>

        {/* Grid de modelos */}
        <div className="flex-1 p-6 overflow-auto">
          {filteredModelos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-base-content/60">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron modelos
              </h3>
              <p className="text-sm">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Crea tu primer modelo"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredModelos.map((modelo) => (
                <div
                  key={modelo._id}
                  className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300"
                >
                  {/* Header de la card */}
                  <div className="card-body p-0">
                    <div className="p-6 pb-4">
                      {/* Avatar y título */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                            <span className="text-lg font-bold">
                              {modelo.modelo.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-base-content">
                            {modelo.modelo}
                          </h3>
                          <div className="badge badge-outline badge-primary text-xs">
                            {modelo.producto}
                          </div>
                        </div>
                      </div>

                      {/* Información del modelo */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            className="w-4 h-4 text-base-content/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6h16M4 10h16M4 14h16M4 18h16"
                            />
                          </svg>
                          <span className="text-base-content/70">
                            Dimensiones:
                          </span>
                          <span className="font-medium">
                            {modelo.ancho} x {modelo.alto}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            className="w-4 h-4 text-base-content/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          <span className="text-base-content/70">Color:</span>
                          <span className="font-medium">{modelo.tipo}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            className="w-4 h-4 text-base-content/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <span className="text-base-content/70">
                            Cantidad/m² | ml | und:
                          </span>
                          <span className="font-medium">
                            {modelo.placas_por_metro}
                          </span>
                        </div>

                        {modelo.fecha_creacion && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-4 h-4 text-base-content/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-base-content/70">
                              Creado:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                modelo.fecha_creacion
                              ).toLocaleDateString("es-AR")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="card-actions justify-end p-6 pt-0">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(modelo)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NuevoModelo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modelo={selectedModelo}
        onSave={handleSave}
      />

      {/* Modal de configuración de stock */}
      <NuevoStock
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        stock={selectedStockForEdit}
        onSave={handleStockSave}
        modelos={modelos}
      />

      {/* Modal de confirmación de creación */}
      {createdModelo && createdStock && (
        <ModeloStockCreatedModal
          isOpen={showCreatedModal}
          onClose={handleCloseCreatedModal}
          onGoToStockConfig={handleGoToStockConfig}
          modelo={createdModelo}
          stock={createdStock}
        />
      )}
    </div>
  );
};

export default Modelos;
