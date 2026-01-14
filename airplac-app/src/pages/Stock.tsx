import React, { useState, useEffect } from "react";
import axios from "axios";
import NuevoStock from "../componets/NuevoStock";
import AgregarStockMejorado from "../componets/AgregarStockMejorado";
import ModificarPrecio from "../componets/ModificarPrecio";
import { MoreVertical } from "lucide-react";
import { API_BASE_URL } from "../config";
import SuccessModal from "../componets/SuccessModal";

interface PedidoReservado {
  cantidad: number;
  cantidad_placas: number;
  idPedido: string;
  remito: string;
  cliente: string;
  estado: string;
}

interface StockReservado {
  pedidos: PedidoReservado[];
  total_reservado: number;
}

interface Stock {
  _id: string;
  idModelo?: string;
  producto: string;
  modelo: string;
  cantidad_actual: number;
  stock: number;
  unidad: string;
  produccion_diaria: number;
  stockActivo: boolean;
  stock_reservado: StockReservado;
  metros_cuadrados: number;
  total_pendiente: number;
  precio_base: number;
  total_pre_reserva: number;
}

const Stock: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAgregarStockOpen, setIsAgregarStockOpen] = useState(false);
  const [isModificarPrecioOpen, setIsModificarPrecioOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [modelos, setModelos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Stock | "reservas" | "pendiente" | "disponible" | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const fetchStocks = async (preserveFilter: boolean = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stock/`);
      setStocks(response.data);
      console.log(response.data);
      
      // Si hay un filtro activo y se solicita preservarlo, re-aplicar el filtro
      if (preserveFilter && searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        const stockFiltrado = response.data.filter((stock: Stock) =>
          Object.values(stock).some(
            (val) =>
              typeof val === "string" && val.toLowerCase().includes(searchTermLower)
          )
        );
        setFilteredStocks(stockFiltrado);
      } else {
        setFilteredStocks(response.data);
      }
      
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

  const handleModificarPrecio = (stock: Stock) => {
    setSelectedStock(stock);
    setIsModificarPrecioOpen(true);
  };

  const refrescarStock = async (stock: Stock) => {
    try {
      await axios.post(`${API_BASE_URL}/stock/refrescar`, stock);
    } catch (error) {
      console.error("Error al actualizar", error);
    }
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
      await fetchStocks(true);
      setSuccessMessage("Stock creado/actualizado exitosamente.");
    } catch (err: any) {
      console.error("Error al guardar el stock:", err);
      if (err.response) {
        console.error("Detalles del error:", err.response.data);
      }
    }
  };

  const handleGuardarProduccion = async (
    tipo: "add" | "subtract",
    valor: number,
    responsable: string
  ) => {
    try {
      if (selectedStock) {
        let endpoint = "";
        let payload: any = { responsable };

        switch (tipo) {
          case "add":
            endpoint = `${API_BASE_URL}/stock/add/${selectedStock._id}`;
            payload.cantidad = valor;
            break;
          case "subtract":
            endpoint = `${API_BASE_URL}/stock/subtract/${selectedStock._id}`;
            payload.cantidad = valor;
            break;
        }

        const response = await axios.put(endpoint, payload);
        console.log("Respuesta del servidor:", response.data);
        
        setIsAgregarStockOpen(false);
        await fetchStocks(true);
        
        // Mensaje personalizado según el tipo de operación
        const operacionTexto = 
          tipo === "add" ? `incrementado en ${valor}` : `reducido en ${valor}`;
        
        setSuccessMessage(`Stock ${operacionTexto} exitosamente.`);
      }
    } catch (err: any) {
      console.error("Error al modificar el stock:", err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Error al modificar el stock");
      }
    }
  };

  const handleSavePrecio = async (payload: any) => {
    try {
      // El payload ahora contiene { precios: [...] }
      await axios.put(
        `${API_BASE_URL}/stock/precios/${selectedStock?.idModelo}`,
        payload
      );
      setIsModificarPrecioOpen(false);
      await fetchStocks(true);
      setSuccessMessage("Precios guardados exitosamente.");
    } catch (err: any) {
      console.error("Error al guardar los precios:", err);
      if (err.response) {
        console.error("Detalles del error:", err.response.data);
      }
    }
  };

  const handleSavePrecioSilent = async (payload: any) => {
    try {
      // El payload ahora contiene { precios: [...] }
      await axios.put(
        `${API_BASE_URL}/stock/precios/${selectedStock?.idModelo}`,
        payload
      );
      await fetchStocks(true);
      // NO se establece successMessage aquí
    } catch (err: any) {
      console.error("Error al guardar los precios:", err);
      if (err.response) {
        console.error("Detalles del error:", err.response.data);
      }
    }
  };

  // Función para ordenar los datos
  const sortData = (data: Stock[]) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Manejar columnas calculadas
      if (sortConfig.key === "reservas") {
        aValue =
          a.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "reservado")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
        bValue =
          b.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "reservado")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
      } else if (sortConfig.key === "pendiente") {
        aValue =
          a.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "pendiente")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
        bValue =
          b.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "pendiente")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
      } else if (sortConfig.key === "disponible") {
        // Calcular stock disponible: stock - reservas - pendientes
        const aReservas =
          a.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "reservado")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
        const aPendientes =
          a.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "pendiente")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
        aValue = a.stock - aReservas - aPendientes;

        const bReservas =
          b.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "reservado")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
        const bPendientes =
          b.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "pendiente")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0) || 0;
        bValue = b.stock - bReservas - bPendientes;
      } else {
        // Columnas normales
        aValue = a[sortConfig.key as keyof Stock];
        bValue = b[sortConfig.key as keyof Stock];
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        const comparison = aValue - bValue;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      }

      return 0;
    });
  };

  // Funciones de paginación
  const sortedStocks = sortData(filteredStocks);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedStocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset a la primera página cuando se busca
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

  // Función para manejar el ordenamiento
  const handleSort = (
    key: keyof Stock | "reservas" | "pendiente" | "disponible"
  ) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  if (loading) return <p>Cargando stocks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const renderAcciones = (stock: Stock) => (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className="btn btn-sm btn-ghost">
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
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 z-[9999]"
      >
        <li>
          <button
            onClick={() => handleAgregarStock(stock)}
            className="flex items-center gap-2"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Agregar Stock
          </button>
        </li>
        <li>
          <button
            onClick={() => handleModificarPrecio(stock)}
            className="flex items-center gap-2"
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Modificar Precio
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="p-4">
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      <div className="h-[calc(100vh-8rem)] flex flex-col">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Gestión de Stock
            </h2>
            <div className="flex items-center gap-2">
              <div className="join">
                <input
                  onChange={(e) => handleSearch(e.target.value)}
                  type="text"
                  className="input input-bordered join-item w-64"
                  placeholder="Buscar por producto, modelo..."
                  value={searchTerm}
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearch("")}
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
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="overflow-x-auto flex-1">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("modelo")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        Modelo
                        {sortConfig.key === "modelo" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("producto")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        Tipo prod
                        {sortConfig.key === "producto" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("stock")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Stock
                        {sortConfig.key === "stock" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("metros_cuadrados")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M4 6h16M4 10h16M4 14h16M4 18h16"
                          />
                        </svg>
                        Un. Med
                        {sortConfig.key === "metros_cuadrados" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("reservas")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        Reservas
                        {sortConfig.key === "reservas" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("pendiente")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Pendiente
                        {sortConfig.key === "pendiente" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("disponible")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Disponible
                        {sortConfig.key === "disponible" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-base-300 transition-colors duration-200"
                      onClick={() => handleSort("precio_base")}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        Precio
                        {sortConfig.key === "precio_base" && (
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.direction === "asc" ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="text-xs font-medium uppercase tracking-wider">
                      <div className="flex items-center gap-2">
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Acciones
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((stock) => (
                    <tr
                      key={stock._id}
                      className="hover:bg-base-200 transition-colors duration-200"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                              <span className="text-xs font-bold">
                                {stock.modelo.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-base-content">
                              {stock.modelo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="badge badge-outline badge-primary gap-1">
                          <svg
                            className="w-3 h-3"
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
                          {stock.producto}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              stock.stock > 100
                                ? "text-success"
                                : stock.stock > 50
                                ? "text-warning"
                                : "text-error"
                            }`}
                          >
                            {Number(stock.stock).toFixed(2)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs text-base-content/60">
                              unidades
                            </span>
                            {stock.stock < 50 && (
                              <div className="badge badge-error badge-xs gap-1">
                                <svg
                                  className="w-2 h-2"
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
                                Bajo
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {Number(stock.metros_cuadrados).toFixed(2)}
                          </span>
                          <span className="text-xs text-base-content/60">
                            {stock.unidad === "M2"
                              ? "m²"
                              : stock.unidad === "ML"
                              ? "ml"
                              : "und"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          className="tooltip tooltip-left"
                          data-tip={
                            stock.stock_reservado?.pedidos?.length > 0
                              ? stock.stock_reservado.pedidos
                                  .filter(
                                    (pedido) => pedido.estado === "reservado"
                                  )
                                  .map(
                                    (pedido) =>
                                      `📋 Remito: ${
                                        pedido.remito
                                      } | 👤 Cliente: ${
                                        pedido.cliente || "Sin especificar"
                                      } | 📦 Cantidad: ${
                                        pedido.cantidad_placas
                                      }`
                                  )
                                  .join("\n")
                              : "Sin reservas activas"
                          }
                        >
                          <div
                            className={`badge gap-2 cursor-help transition-all duration-200 ${
                              (stock.stock_reservado?.pedidos
                                ?.filter(
                                  (pedido) => pedido.estado === "reservado"
                                )
                                .reduce(
                                  (total, pedido) =>
                                    total + pedido.cantidad_placas,
                                  0
                                ) || 0) > 0
                                ? "badge-warning"
                                : "badge-neutral"
                            }`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            {Number(
                              stock.stock_reservado?.pedidos
                                ?.filter(
                                  (pedido) => pedido.estado === "reservado"
                                )
                                .reduce(
                                  (total, pedido) =>
                                    total + pedido.cantidad_placas,
                                  0
                                ) || 0
                            ).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          className="tooltip tooltip-left"
                          data-tip={
                            stock.stock_reservado?.pedidos?.length > 0
                              ? stock.stock_reservado.pedidos
                                  .filter(
                                    (pedido) => pedido.estado === "pendiente"
                                  )
                                  .map(
                                    (pedido) =>
                                      `📋 Remito: ${
                                        pedido.remito
                                      } | 👤 Cliente: ${
                                        pedido.cliente || "Sin especificar"
                                      } | 📦 Cantidad: ${
                                        pedido.cantidad_placas
                                      }`
                                  )
                                  .join("\n")
                              : "Sin pedidos pendientes"
                          }
                        >
                          <div
                            className={`badge gap-2 cursor-help transition-all duration-200 ${
                              (stock.stock_reservado?.pedidos
                                ?.filter(
                                  (pedido) => pedido.estado === "pendiente"
                                )
                                .reduce(
                                  (total, pedido) =>
                                    total + pedido.cantidad_placas,
                                  0
                                ) || 0) > 50
                                ? "badge-error"
                                : (stock.stock_reservado?.pedidos
                                    ?.filter(
                                      (pedido) => pedido.estado === "pendiente"
                                    )
                                    .reduce(
                                      (total, pedido) =>
                                        total + pedido.cantidad_placas,
                                      0
                                    ) || 0) > 20
                                ? "badge-warning"
                                : "badge-neutral"
                            }`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {Number(
                              stock.stock_reservado?.pedidos
                                ?.filter(
                                  (pedido) => pedido.estado === "pendiente"
                                )
                                .reduce(
                                  (total, pedido) =>
                                    total + pedido.cantidad_placas,
                                  0
                                ) || 0
                            ).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td>
                        {(() => {
                          const reservas =
                            stock.stock_reservado?.pedidos
                              ?.filter(
                                (pedido) => pedido.estado === "reservado"
                              )
                              .reduce(
                                (total, pedido) =>
                                  total + pedido.cantidad_placas,
                                0
                              ) || 0;
                          const pendientes =
                            stock.stock_reservado?.pedidos
                              ?.filter(
                                (pedido) => pedido.estado === "pendiente"
                              )
                              .reduce(
                                (total, pedido) =>
                                  total + pedido.cantidad_placas,
                                0
                              ) || 0;
                          const disponible =
                            stock.stock - reservas - pendientes;

                          return (
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-lg font-bold ${
                                  disponible > 50
                                    ? "text-success"
                                    : disponible > 20
                                    ? "text-warning"
                                    : "text-error"
                                }`}
                              >
                                {Number(disponible).toFixed(2)}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs text-base-content/60">
                                  disponibles
                                </span>
                                {disponible < 20 && (
                                  <div className="badge badge-warning badge-xs gap-1">
                                    <svg
                                      className="w-2 h-2"
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
                                    Crítico
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-success">
                            $
                            {(stock.precio_base || 0).toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </td>
                      <td>{renderAcciones(stock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="bg-base-200 px-6 py-4 border-t">
              <div className="flex justify-between items-center">
                <div className="text-sm text-base-content/60">
                  Mostrando {indexOfFirstItem + 1} a{" "}
                  {Math.min(indexOfLastItem, filteredStocks.length)} de{" "}
                  {filteredStocks.length} productos
                </div>
                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        className={`join-item btn btn-sm ${
                          currentPage === pageNum ? "btn-primary" : ""
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AgregarStockMejorado
        isOpen={isAgregarStockOpen}
        onClose={() => setIsAgregarStockOpen(false)}
        idStock={selectedStock?._id || ""}
        stockActual={selectedStock?.stock || 0}
        stockReservado={
          ((selectedStock?.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "reservado")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0)) || 0) +
          ((selectedStock?.stock_reservado?.pedidos
            ?.filter((pedido) => pedido.estado === "pendiente")
            .reduce((total, pedido) => total + pedido.cantidad_placas, 0)) || 0)
        }
        unidad={selectedStock?.unidad || ""}
        producto={selectedStock?.producto || ""}
        modelo={selectedStock?.modelo || ""}
        onSave={handleGuardarProduccion}
      />

      <ModificarPrecio
        isOpen={isModificarPrecioOpen}
        onClose={() => setIsModificarPrecioOpen(false)}
        precio={null}
        onSave={handleSavePrecio}
        onSaveSilent={handleSavePrecioSilent}
        modelo={selectedStock}
      />
    </div>
  );
};

export default Stock;
