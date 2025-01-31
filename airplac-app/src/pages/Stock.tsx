import React, { useState, useEffect } from "react";
import axios from "axios";
import NuevoStock from "../componets/NuevoStock";
import AgregarStock from "../componets/AgregarStock";
import { FaEllipsisV } from "react-icons/fa";

interface Stock {
  _id: string;
  producto: string;
  modelo: string;
  cantidad_actual: number;
  unidad: string;
  produccion_diaria: number;
  valor_m2: number;
  valor_m2_materiales: number;
  valor_m2_pegamento: number;
  valor_m2_sella: number;
  stockActivo: boolean;
}

const Stock: React.FC = () => {
  // Estados
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgregarStockOpen, setIsAgregarStockOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [modelos, setModelos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };
  // Obtener datos desde la API
  const fetchStocks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/stock/");
      setStocks(response.data);
      setFilteredStocks(response.data); // Inicializar lista filtrada con la misma data
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los stocks.");
      setLoading(false);
    }
  };

  const fetchModelos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/modelos/");
      setModelos(response.data.map((modelo: any) => modelo.modelo));
    } catch (err) {
      console.error("Error al cargar los modelos:", err);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchModelos();
  }, []);

  // Función para buscar en cualquier columna del stock
  const buscarStock = (value: string) => {
    setSearchTerm(value);

    if (!value) {
      setFilteredStocks(stocks); // Restaurar datos originales
      return;
    }

    const searchTermLower = value.toLowerCase();

    const stockFiltrado = stocks.filter((stock) =>
      Object.values(stock).some(
        (val) =>
          typeof val === "string" && val.toLowerCase().includes(searchTermLower)
      )
    );

    setFilteredStocks(stockFiltrado);
  };

  // Funciones para manejo de acciones
  const handleEdit = (stock: Stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleAgregarStock = (stock: Stock) => {
    setSelectedStock(stock);
    setIsAgregarStockOpen(true);
  };

  const handleSave = async (stock: Stock) => {
    try {
      if (stock._id) {
        await axios.put(`http://localhost:3000/api/stock/${stock._id}`, stock);
      } else {
        await axios.post("http://localhost:3000/api/stock/", stock);
      }
      setIsModalOpen(false);
      setSelectedStock(null);
      fetchStocks();
    } catch (err) {
      console.error("Error al guardar el stock:", err);
    }
  };

  const handleGuardarProduccion = async (
    cantidad: number,
    responsable: string
  ) => {
    try {
      if (selectedStock) {
        await axios.post("http://localhost:3000/api/stock/actualizar-stock", {
          idStock: selectedStock._id,
          cantidad,
          responsable,
        });
        setIsAgregarStockOpen(false);
        fetchStocks();
      }
    } catch (err) {
      console.error("Error al agregar producción:", err);
    }
  };

  if (loading) return <p>Cargando stocks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="">
      <div className="flex justify-between mb-4">
        {/* Buscador */}
        <label className="input input-bordered flex items-center gap-2">
          <input
            onChange={(e) => buscarStock(e.target.value)}
            type="text"
            className="grow"
            placeholder="Buscar"
            value={searchTerm}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>

        {/* Botón para nuevo stock */}
        <button
          className="btn btn-success"
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo Stock
        </button>
      </div>

      {/* Tabla de stocks */}
      <table className="table w-full">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Modelo</th>
            <th>Cantidad Actual</th>
            <th>Unidad</th>
            <th>Producción Diaria</th>
            <th>Valor M2 Materiales</th>
            <th>Valor M2 Pegamento</th>
            <th>Valor M2 Sella</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredStocks.map((stock) => (
            <tr key={stock._id}>
              <td>{stock.producto}</td>
              <td>{stock.modelo}</td>
              <td>{stock.cantidad_actual}</td>
              <td>{stock.unidad}</td>
              <td>{stock.produccion_diaria}</td>
              <td>{stock.valor_m2_materiales}</td>
              <td>{stock.valor_m2_pegamento}</td>
              <td>{stock.valor_m2_sella}</td>
              <td className="relative">
                <button
                  className="btn btn-outline"
                  onClick={() => toggleDropdown(stock._id)}
                >
                  <FaEllipsisV />
                </button>

                {openDropdown === stock._id && (
                  <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 absolute z-50">
                    <li>
                      <button onClick={() => handleEdit(stock)}>Editar</button>
                    </li>
                    <li>
                      <button onClick={() => handleAgregarStock(stock)}>
                        Agregar Stock
                      </button>
                    </li>
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modales */}
      <NuevoStock
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stock={selectedStock}
        onSave={handleSave}
        modelos={modelos}
      />

      <AgregarStock
        isOpen={isAgregarStockOpen}
        onClose={() => setIsAgregarStockOpen(false)}
        idStock={selectedStock?._id || ""}
        onSave={handleGuardarProduccion}
      />
    </div>
  );
};

export default Stock;
