import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import PreciosMasivos from "../componets/PreciosMasivos";

interface Producto {
  nombre: string;
  totalModelos: number;
}

const Precios = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"actualizar" | "adicional">("actualizar");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/modelos/`);
      
      // Agrupar modelos por producto
      const productosMap = new Map<string, number>();
      response.data.forEach((modelo: any) => {
        const count = productosMap.get(modelo.producto) || 0;
        productosMap.set(modelo.producto, count + 1);
      });

      const productosArray = Array.from(productosMap.entries()).map(([nombre, totalModelos]) => ({
        nombre,
        totalModelos
      }));

      setProductos(productosArray);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarMasivo = (producto: string) => {
    setSelectedProducto(producto);
    setModalType("actualizar");
    setIsModalOpen(true);
  };

  const handleCrearAdicional = (producto: string) => {
    setSelectedProducto(producto);
    setModalType("adicional");
    setIsModalOpen(true);
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
        {/* Header con estadísticas y búsqueda */}
        <div className="bg-gradient-to-r from-primary to-primary-focus p-6 text-primary-content">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestión de Precios Masivos</h1>
              <p className="text-primary-content/80">
                Actualiza precios por producto de forma masiva
              </p>
            </div>
            
            <div className="stats shadow bg-base-100 text-base-content">
              <div className="stat place-items-center">
                <div className="stat-title">Total Productos</div>
                <div className="stat-value text-primary">{productos.length}</div>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Buscar producto..."
              className="input input-bordered w-full max-w-md bg-base-100 text-base-content"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProductos.map((producto) => (
              <div
                key={producto.nombre}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="card-body">
                  <h2 className="card-title text-2xl">
                    {producto.nombre}
                    <div className="badge badge-primary">{producto.totalModelos} modelos</div>
                  </h2>
                  
                  <div className="divider my-2"></div>
                  
                  <div className="card-actions justify-end gap-2 mt-4">
                    <button
                      className="btn btn-primary flex-1"
                      onClick={() => handleActualizarMasivo(producto.nombre)}
                    >
                      <svg
                        className="w-5 h-5"
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
                      Precio Base 
                    </button>
                    
                    <button
                      className="btn btn-secondary flex-1"
                      onClick={() => handleCrearAdicional(producto.nombre)}
                    >
                      <svg
                        className="w-5 h-5"
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
                      Precio Adicional
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProductos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-base-content/60 text-lg">
                No se encontraron productos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de precios masivos */}
      <PreciosMasivos
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        producto={selectedProducto || ""}
        tipo={modalType}
        onSuccess={fetchProductos}
      />
    </div>
  );
};

export default Precios;
