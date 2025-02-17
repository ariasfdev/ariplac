import React, { useState } from "react";
import { useAppContext } from "../context/AppContext"; // Ajusta la ruta si está en otra carpeta
import { API_BASE_URL } from "../config"; // Ajusta la ruta si está en otra carpeta
import Modal from "./Modal"; // Ajusta la ruta si está en otra carpeta
import NuevoPedido from "./NuevoPedido"; // Ajusta la ruta si está en otra carpeta
import ErrorModal from "./ErrorModal"; // Si deseas mostrar errores globales
import { MoreVertical } from "lucide-react"; // Asegúrate de tener esta librería
import RemitoModal from "./RemitoModal"; // Ajusta o quita si no lo usas
import EditarPedido from "./EditarPedido"; // Ajusta o quita si no lo usas

const columns = [
  { key: "remito", label: "Remito", visible: true },
  { key: "fecha", label: "Fecha", visible: true },
  { key: "año", label: "Año", visible: false },
  { key: "cliente", label: "Cliente", visible: true },
  { key: "direccion", label: "Dirección", visible: false },
  { key: "contacto", label: "Contacto", visible: false },
  { key: "detalle", label: "Detalle", visible: true },
  { key: "cantidadM2", label: "Cantidad M2", visible: true },
  { key: "materiales", label: "Materiales", visible: true },
  { key: "pago", label: "Pago", visible: false },
  { key: "procedencia", label: "Procedencia", visible: false },
  { key: "seña", label: "Seña", visible: false },
  { key: "descuento", label: "Descuento", visible: false },
  { key: "total", label: "Total", visible: true },
  { key: "estado", label: "Estado", visible: true },
  { key: "disponible", label: "Disponible", visible: false },
  { key: "acciones", label: "Acciones", visible: true },
];

const TablePedidos: React.FC = () => {
  const { pedidos, fetchPedidos, error } = useAppContext();
  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [remitoData, setRemitoData] = useState<any | null>(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState<any | null>(null);

  // Estado para ordenar
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  // Función para cambiar la columna de ordenamiento
  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        // Si se hace clic nuevamente, invertir la dirección
        return {
          key: columnKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Si se selecciona una nueva columna, por defecto ascendente
        return { key: columnKey, direction: "asc" };
      }
    });
  };

  // Manejo de columnas visibles
  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Creación y edición de pedidos
  const handlePedidoCreado = () => {
    fetchPedidos();
    setIsModalOpen(false);
  };

  const handleEditar = (pedido: any) => {
    setPedidoParaEditar(pedido);
  };

  // Búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Primero se filtran los pedidos según la búsqueda
  const filteredPedidos = pedidos.filter((pedido) =>
    visibleColumns.some(
      (col) =>
        col.visible &&
        pedido[col.key as keyof typeof pedido]
          ?.toString()
          .toLowerCase()
          .includes(searchQuery)
    )
  );

  // Se ordena el array filtrado según sortConfig
  const sortedPedidos = React.useMemo(() => {
    if (!sortConfig.key) return filteredPedidos;
    const sorted = [...filteredPedidos].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      // Comparación numérica o string
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      } else {
        return aValue?.toString().localeCompare(bValue?.toString());
      }
    });
    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [filteredPedidos, sortConfig]);

  // Calcular el número de remito más alto y sumar 1
  const maxRemito =
    pedidos.length > 0
      ? Math.max(...pedidos.map((pedido) => Number(pedido.remito) || 0))
      : 0;
  const nextRemito = maxRemito + 1;

  // Acciones (remitir, marcar como entregado, etc.)
  const handleAccion = (pedido: any) => {
    if (pedido.estado === "entregado") {
      setRemitoData(pedido);
    } else if (pedido.estado === "retira") {
      cambiarEstado(pedido.id, "entregado");
    }
  };

  const cambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pedidos/${nuevoEstado}/${pedidoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        fetchPedidos();
        alert(`Estado cambiado a ${nuevoEstado}`);
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert(`Error al cambiar el estado: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Ocurrió un error al intentar cambiar el estado.");
    }
  };

  const verComprobante = (url: string) => {
    window.open(url, "_blank");
  };

  const renderAcciones = (row: any) => (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className="btn btn-sm btn-ghost">
        <MoreVertical className="w-5 h-5" />
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-40 z-50"
      >
        {row.estado === "entregado" && (
          <li>
            <button onClick={() => handleAccion(row)}>Remitir</button>
          </li>
        )}

        {["retira", "enviar", "instalacion"].includes(row.estado) && (
          <>
            <li>
              <button onClick={() => cambiarEstado(row.id, "entregado")}>
                Marcar como Entregado
              </button>
            </li>
            <li>
              <button onClick={() => handleEditar(row)}>Editar Pedido</button>
            </li>
          </>
        )}

        {row.remitos && row.remitos.length > 0 && (
          <li>
            <button onClick={() => verComprobante(row.remitos[0].url)}>
              Ver Comprobante
            </button>
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Encabezado con configuración de columnas, nuevo pedido y búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex gap-4 flex-wrap w-full sm:w-auto">
          {/* Configurar columnas */}
          <div className="dropdown dropdown-hover">
            <label tabIndex={0} className="btn btn-outline w-full sm:w-auto">
              Configurar Columnas
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 z-50"
            >
              {visibleColumns.map((col) => (
                <li key={col.key}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumnVisibility(col.key)}
                    />
                    {col.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Nuevo pedido */}
          <button
            className="btn btn-outline w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Nuevo pedido
          </button>
        </div>

        {/* Búsqueda */}
        <label className="input input-bordered flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            className="grow"
            placeholder="Buscar"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </label>
      </div>

      {/* Errores globales (opcional) */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Modal de remito (opcional, si tienes RemitoModal) */}
      {remitoData && (
        <RemitoModal
          remitoData={remitoData}
          onClose={() => setRemitoData(null)}
        />
      )}

      {/* Tabla principal */}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full text-sm sm:text-base">
          <thead>
            <tr>
              {visibleColumns
                .filter((col) => col.visible)
                .map((col) => (
                  <th
                    key={col.key}
                    className="px-2 py-1 sm:px-4 sm:py-2 cursor-pointer select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {/* Indicador de ordenamiento */}
                    {sortConfig.key === col.key && (
                      <span>
                        {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                      </span>
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {sortedPedidos.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {visibleColumns
                  .filter((col) => col.visible)
                  .map((col) => (
                    <td key={col.key} className="px-2 py-1 sm:px-4 sm:py-2">
                      {col.key === "acciones"
                        ? renderAcciones(row)
                        : row[col.key as keyof typeof row]}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Nuevo Pedido */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NuevoPedido
          onClose={() => setIsModalOpen(false)}
          onPedidoCreado={handlePedidoCreado}
          remito={nextRemito}
        />
      </Modal>

      {/* Modal para Editar Pedido (opcional, si tienes EditarPedido) */}
      {pedidoParaEditar && (
        <Modal
          isOpen={!!pedidoParaEditar}
          onClose={() => setPedidoParaEditar(null)}
        >
          <EditarPedido
            pedido={pedidoParaEditar}
            onClose={() => {
              setPedidoParaEditar(null);
              fetchPedidos(); // Refresca la lista de pedidos al cerrar
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default TablePedidos;
