import React, { useState, useEffect } from "react";
import axios from "axios";
import NuevoStock from "../componets/NuevoStock";
import AgregarStock from "../componets/AgregarStock";
import { MoreVertical } from "lucide-react";
import { API_BASE_URL } from "../config";

interface Stock {
  _id: string;
  idModelo?: string;
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
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgregarStockOpen, setIsAgregarStockOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [modelos, setModelos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStocks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stock/`);
      setStocks(response.data);
      setFilteredStocks(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los stocks.");
      setLoading(false);
    }
  };

  const fetchModelos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/modelos/`);
      setModelos(response.data.map((modelo: any) => modelo));
    } catch (err) {
      console.error("Error al cargar los modelos:", err);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchModelos();
  }, []);

  const buscarStock = (value: string) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredStocks(stocks);
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
        await axios.put(`${API_BASE_URL}/stock/${stock._id}`, stock);
      } else {
        const { _id, idModelo, ...stockSinId } = stock;
        const payload = idModelo ? { ...stockSinId, idModelo } : stockSinId;
        await axios.post(`${API_BASE_URL}/stock/`, payload);
      }

      setIsModalOpen(false);
      setSelectedStock(null);
      fetchStocks();
    } catch (err: any) {
      console.error("Error al guardar el stock:", err);
      if (err.response) {
        console.error("Detalles del error:", err.response.data);
      }
    }
  };

  const handleGuardarProduccion = async (
    cantidad: number,
    responsable: string
  ) => {
    try {
      if (selectedStock) {
        await axios.post(`${API_BASE_URL}/stock/actualizar-stock`, {
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

  const renderAcciones = (stock: Stock) => (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className="btn btn-sm btn-ghost">
        <MoreVertical className="w-5 h-5" />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-40 z-[9999]"
      >
        <li>
          <button onClick={() => handleEdit(stock)}>Editar</button>
        </li>
        <li>
          <button onClick={() => handleAgregarStock(stock)}>
            Agregar Stock
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <label className="input input-bordered flex items-center gap-2">
          <input
            onChange={(e) => buscarStock(e.target.value)}
            type="text"
            className="grow"
            placeholder="Buscar"
            value={searchTerm}
          />
        </label>

        <button
          className="btn btn-success"
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo Stock
        </button>
      </div>

      <div className="mb-8">
        <table className="table table-zebra w-full text-sm sm:text-base">
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
                <td>{renderAcciones(stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
