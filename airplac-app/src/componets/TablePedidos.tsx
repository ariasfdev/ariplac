import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../config";
import Modal from "./Modal";
import NuevoPedido from "./NuevoPedido";
import ErrorModal from "./ErrorModal";
import { MoreVertical } from "lucide-react";
import RemitoModal from "./RemitoModal";
import SuccessModal from "./SuccessModal";
import ConfirmActionModal from "./ConfirmActionModal";

// Componente para el modal de comentarios
const ComentarioModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (comentario: string) => void;
  titulo: string;
  comentarioActual?: string;
}> = ({ isOpen, onClose, onSave, titulo, comentarioActual }) => {
  const [comentario, setComentario] = useState(comentarioActual || "");

  const handleSave = () => {
    onSave(comentario);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{titulo}</h3>
        <textarea
          className="textarea textarea-bordered w-full h-32"
          placeholder="Escribe tu comentario aquí..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// Tipos
interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ActionState {
  pedidoId: string;
  tipo: "eliminar" | "entregar";
}

interface Pedido {
  id: string;
  remito: string;
  fecha: string;
  cliente: string;
  detalle: string;
  cantidadM2: number;
  materiales: string;
  total: number;
  total_pendiente: number;
  estado: string;
  disponible: string;
  productos?: any[];
  masDeUnProducto?: boolean;
  remitos?: any[];
  [key: string]: any; // Para permitir acceso dinámico a propiedades
}

// Configuración de columnas
const COLUMNS: Column[] = [
  { key: "remito", label: "Remito", visible: true },
  { key: "fecha", label: "Fecha", visible: true },
  { key: "año", label: "Año", visible: false },
  { key: "cliente", label: "Cliente", visible: true },
  { key: "direccion", label: "Dirección", visible: false },
  { key: "contacto", label: "Contacto", visible: false },
  { key: "detalle", label: "Producto", visible: true },
  { key: "cantidadM2", label: "Cant.", visible: true },
  { key: "materiales", label: "Materiales", visible: true },
  { key: "pago", label: "Pago", visible: false },
  { key: "procedencia", label: "Procedencia", visible: false },
  { key: "seña", label: "Seña", visible: false },
  { key: "descuento", label: "Descuento", visible: false },
  { key: "total", label: "Total", visible: true },
  { key: "total_pendiente", label: "Pend. pago", visible: true },
  { key: "estado", label: "Estado", visible: true },
  { key: "disponible", label: "Disponible", visible: true },
  { key: "acciones", label: "Acciones", visible: true },
];

// Hook personalizado para el estado de la tabla
const useTableState = () => {
  const [visibleColumns, setVisibleColumns] = useState<Column[]>(COLUMNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [ocultarEntregados, setOcultarEntregados] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "remito",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  return {
    visibleColumns,
    setVisibleColumns,
    searchQuery,
    setSearchQuery,
    expandedRows,
    setExpandedRows,
    ocultarEntregados,
    setOcultarEntregados,
    sortConfig,
    setSortConfig,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  };
};

// Hook personalizado para modales
const useModalState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remitoData, setRemitoData] = useState<any | null>(null);
  const [pedidoParaEditar, setPedidoParaEditar] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [accionActual, setAccionActual] = useState<ActionState | null>(null);

  return {
    isModalOpen,
    setIsModalOpen,
    remitoData,
    setRemitoData,
    pedidoParaEditar,
    setPedidoParaEditar,
    modalOpen,
    setModalOpen,
    accionActual,
    setAccionActual,
  };
};

// Hook personalizado para mensajes
const useMessageState = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  return {
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
  };
};

// Utilidades
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return "$0,00";
  return `$${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getEstadoBadgeClass = (estado: string): string => {
  const estadoLower = estado.toLowerCase();
  const colorMap: Record<string, string> = {
    pendiente: "badge-error",
    entregado: "badge-success",
    disponible: "badge-info",
    enviar: "badge-warning",
    instalacion: "badge-secondary",
    retira: "badge-primary",
  };
  return colorMap[estadoLower] || "badge-ghost";
};

// Componente para el badge de estado
const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => (
  <span className={`badge ${getEstadoBadgeClass(estado)} capitalize`}>
    {estado}
  </span>
);

// Componente para el encabezado de la tabla
const TableHeader: React.FC<{
  visibleColumns: Column[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  onToggleColumn: (key: string) => void;
  onNuevoPedido: () => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ocultarEntregados: boolean;
  onOcultarEntregadosChange: (checked: boolean) => void;
}> = ({
  visibleColumns,
  sortConfig,
  onSort,
  onToggleColumn,
  onNuevoPedido,
  searchQuery,
  onSearchChange,
  ocultarEntregados,
  onOcultarEntregadosChange,
}) => (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Gestión de Pedidos
    </h2>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-primary-content text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={ocultarEntregados}
            onChange={(e) => onOcultarEntregadosChange(e.target.checked)}
          />
          Ocultar entregados
        </label>
      </div>
      <div className="join">
        <input
          onChange={onSearchChange}
          type="text"
          className="input input-bordered join-item w-64"
          placeholder="Buscar por remito, cliente, detalle..."
          value={searchQuery}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange({ target: { value: "" } } as any)}
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
      <div className="dropdown dropdown-end">
        <button tabIndex={0} className="btn btn-outline btn-sm">
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
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          Columnas
        </button>
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
                  onChange={() => onToggleColumn(col.key)}
                />
                {col.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <button className="btn btn-primary btn-sm" onClick={onNuevoPedido}>
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
        Nuevo Pedido
      </button>
    </div>
  </div>
);

// Componente para las acciones de la fila
const RowActions: React.FC<{
  row: any;
  onRemitir: (pedido: any) => void;
  onEditar: (pedido: any) => void;
  onCambiarEstado: (pedidoId: string, estado: string) => void;
  onEliminar: (pedidoId: string) => void;
  onVerComprobante: (url: string) => void;
  onComentarioCliente?: (
    tipo: "cliente" | "producto",
    pedidoId: string,
    comentario: string
  ) => void;
  onComentarioProducto?: (
    tipo: "cliente" | "producto",
    pedidoId: string,
    comentario: string
  ) => void;
}> = ({
  row,
  onRemitir,
  onEditar,
  onCambiarEstado,
  onEliminar,
  onVerComprobante,
  onComentarioCliente,
  onComentarioProducto,
}) => (
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
          onClick={() => onRemitir(row)}
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Remitir
        </button>
      </li>

      {row.estado?.toLowerCase() !== "entregado" &&
        row.disponible === "Disponible" && (
          <li>
            <button
              onClick={() => onCambiarEstado(row.id, "entregado")}
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Marcar como Entregado
            </button>
          </li>
        )}

      {["retira", "enviar", "instalacion"].includes(row.estado) && (
        <>
          <li>
            <button
              onClick={() => onEditar(row)}
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar Pedido
            </button>
          </li>
        </>
      )}

      <li>
        <button
          onClick={() => onEliminar(row.id)}
          className="flex items-center gap-2 text-error"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Eliminar Pedido
        </button>
      </li>

      <li>
        <button
          onClick={() =>
            onComentarioCliente?.(
              "cliente",
              row.id,
              row.comentario_cliente || ""
            )
          }
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {row.comentario_cliente
            ? "Editar comentario cliente"
            : "Añadir comentario cliente"}
        </button>
      </li>
      {row.remitos && row.remitos.length > 0 && (
        <li>
          <button
            onClick={() => onVerComprobante(row.remitos![0].url)}
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Ver Comprobante
          </button>
        </li>
      )}
    </ul>
  </div>
);

// Componente para renderizar una celda
const TableCell: React.FC<{
  col: Column;
  row: any;
  isExpanded?: boolean;
  tieneMasDeUnProducto?: boolean;
}> = ({ col, row, isExpanded, tieneMasDeUnProducto }) => {
  const renderCellContent = () => {
    if (col.key === "total" || col.key === "total_pendiente") {
      return (
        <span className="font-bold text-success">
          {formatCurrency(row[col.key] as number)}
        </span>
      );
    }
    if (col.key === "estado") {
      return <EstadoBadge estado={row[col.key] as string} />;
    }
    if (col.key === "disponible") {
      return (
        <span
          className={`badge ${
            row[col.key] === "Disponible" ? "badge-success" : "badge-warning"
          }`}
        >
          {row[col.key]}
        </span>
      );
    }
    if (col.key === "remito") {
      return (
        <div className="flex items-center gap-1">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-5 h-5">
              <span className="text-xs font-bold">#{row[col.key]}</span>
            </div>
          </div>
          <span className="font-medium text-xs">{row[col.key]}</span>
        </div>
      );
    }
    if (col.key === "cliente") {
      return (
        <div className="flex items-center gap-2">
          <div className="badge badge-outline badge-primary">
            <span className="font-bold text-base-content text-sm">
              {row[col.key]}
            </span>
          </div>
          {row.comentario_cliente && (
            <div
              className="tooltip tooltip-left"
              data-tip={row.comentario_cliente}
            >
              <div className="w-2 h-2 bg-info rounded-full"></div>
            </div>
          )}
        </div>
      );
    }
    if (col.key === "detalle") {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row[col.key]}</span>
          {row.comentario_producto && (
            <div
              className="tooltip tooltip-left"
              data-tip={row.comentario_producto}
            >
              <div className="w-2 h-2 bg-info rounded-full"></div>
            </div>
          )}
        </div>
      );
    }
    if (col.key === "cantidadM2") {
      // Función para determinar la unidad basándose en los productos
      const getUnidad = () => {
        if (row.productos && row.productos.length > 0) {
          // Tomar la unidad del primer producto como referencia
          const unidad = row.productos[0].unidad;
          if (unidad === "M2") return "m²";
          if (unidad === "ML") return "ml";
          if (unidad === "UNIDAD") return "unidad";
          return "m²"; // Valor por defecto
        }
        return "m²"; // Valor por defecto si no hay productos
      };

      return (
        <div className="flex items-center gap-1">
          <span className="font-medium text-xs">{row[col.key]}</span>
          <span className="text-xs text-base-content/60">{getUnidad()}</span>
        </div>
      );
    }
    if (col.key === "fecha") {
      const formatDate = (dateString: string) => {
        try {
          const date = new Date(dateString);
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear().toString().slice(-2);
          return `${day}-${month}-${year}`;
        } catch {
          return dateString;
        }
      };

      return (
        <div className="flex items-center gap-1">
          <svg
            className="w-3 h-3 text-base-content/60"
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
          <span className="text-sm font-bold text-base-content">
            {formatDate(row[col.key])}
          </span>
        </div>
      );
    }
    return row[col.key];
  };

  return (
    <td className="px-2 py-1 sm:px-4 sm:py-2">
      {renderCellContent()}
      {col.key === "detalle" && tieneMasDeUnProducto && (
        <span className="ml-2 text-xs text-info">{isExpanded ? "▲" : "▼"}</span>
      )}
    </td>
  );
};

// Componente principal de la tabla
const TablePedidos: React.FC = () => {
  const { pedidos, fetchPedidos, error } = useAppContext();
  const tableState = useTableState();
  const modalState = useModalState();
  const messageState = useMessageState();

  const {
    visibleColumns,
    setVisibleColumns,
    searchQuery,
    setSearchQuery,
    expandedRows,
    setExpandedRows,
    ocultarEntregados,
    setOcultarEntregados,
    sortConfig,
    setSortConfig,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  } = tableState;

  const {
    isModalOpen,
    setIsModalOpen,
    remitoData,
    setRemitoData,
    pedidoParaEditar,
    setPedidoParaEditar,
    modalOpen,
    setModalOpen,
    accionActual,
    setAccionActual,
  } = modalState;

  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    messageState;

  // Estado para el modal de comentarios
  const [showComentarioModal, setShowComentarioModal] = useState(false);
  const [comentarioTipo, setComentarioTipo] = useState<"cliente" | "producto">(
    "cliente"
  );
  const [comentarioActual, setComentarioActual] = useState("");
  const [pedidoIdComentario, setPedidoIdComentario] = useState("");

  const handleComentarioClick = (
    tipo: "cliente" | "producto",
    pedidoId: string,
    comentarioActual: string
  ) => {
    setComentarioTipo(tipo);
    setComentarioActual(comentarioActual);
    setPedidoIdComentario(pedidoId);
    setShowComentarioModal(true);
  };

  const handleSaveComentario = (comentario: string) => {
    if (comentarioTipo === "cliente") {
      handleComentarioCliente(pedidoIdComentario, comentario);
    } else {
      handleComentarioProducto(pedidoIdComentario, comentario);
    }
    setShowComentarioModal(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, []); // Se ejecuta solo al montar el componente

  // Funciones de manejo de eventos
  const toggleExpand = useCallback(
    (remitoId: string) => {
      setExpandedRows((prev) =>
        prev.includes(remitoId)
          ? prev.filter((id) => id !== remitoId)
          : [...prev, remitoId]
      );
    },
    [setExpandedRows]
  );

  const handleSort = useCallback(
    (columnKey: string) => {
      setSortConfig((prev) => {
        if (prev.key === columnKey) {
          return {
            key: columnKey,
            direction: prev.direction === "asc" ? "desc" : "asc",
          };
        } else {
          return { key: columnKey, direction: "asc" };
        }
      });
    },
    [setSortConfig]
  );

  const toggleColumnVisibility = useCallback(
    (key: string) => {
      setVisibleColumns((prev) =>
        prev.map((col) =>
          col.key === key ? { ...col, visible: !col.visible } : col
        )
      );
    },
    [setVisibleColumns]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value.toLowerCase());
      setCurrentPage(1); // Reset a la primera página cuando se busca
    },
    [setSearchQuery, setCurrentPage]
  );

  const handlePedidoCreado = useCallback(() => {
    fetchPedidos();
    setIsModalOpen(false);
    setSuccessMessage("Pedido creado exitosamente.");
  }, [fetchPedidos, setIsModalOpen, setSuccessMessage]);

  const handleEditar = useCallback(
    (pedido: any) => {
      setPedidoParaEditar(pedido);
    },
    [setPedidoParaEditar]
  );

  const cambiarEstado = useCallback(
    (pedidoId: string, nuevoEstado: string) => {
      console.log(`Solicitando cambio de estado para pedido ID: ${pedidoId}`);
      setAccionActual({ pedidoId, tipo: "entregar" });
      setModalOpen(true);
    },
    [setAccionActual, setModalOpen]
  );

  const eliminarPedido = useCallback(
    (pedidoId: string) => {
      setAccionActual({ pedidoId, tipo: "eliminar" });
      setModalOpen(true);
    },
    [setAccionActual, setModalOpen]
  );

  const ejecutarAccionConfirmada = useCallback(async () => {
    if (!accionActual) return;

    const { pedidoId, tipo } = accionActual;

    console.log(`Ejecutando acción: ${tipo} para pedido ID: ${pedidoId}`);

    // Limpiar el estado inmediatamente para evitar múltiples ejecuciones
    setAccionActual(null);
    setModalOpen(false);

    try {
      let response;
      if (tipo === "eliminar") {
        response = await fetch(`${API_BASE_URL}/pedidos/eliminar/${pedidoId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } else if (tipo === "entregar") {
        response = await fetch(
          `${API_BASE_URL}/pedidos/entregado/${pedidoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (response?.ok) {
        await fetchPedidos(); // Esperar a que se complete la actualización
        setSuccessMessage(
          tipo === "eliminar"
            ? "El pedido se eliminó correctamente."
            : "El pedido se marcó como entregado."
        );
      } else {
        const errorData = await response?.json();
        setErrorMessage(
          `Error al ${
            tipo === "eliminar" ? "eliminar" : "cambiar el estado del"
          } pedido: ${errorData.message}`
        );
      }
    } catch (error) {
      console.error("Error ejecutando la acción:", error);
      setErrorMessage(
        `Ocurrió un error al intentar ${
          tipo === "eliminar" ? "eliminar" : "cambiar el estado del"
        } pedido.`
      );
    }
  }, [
    accionActual,
    fetchPedidos,
    setSuccessMessage,
    setErrorMessage,
    setAccionActual,
    setModalOpen,
  ]);

  const verComprobante = useCallback((url: string) => {
    window.open(url, "_blank");
  }, []);

  // Funciones para manejar comentarios
  const handleComentarioCliente = useCallback(
    async (pedidoId: string, comentario: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/pedidos/comentario/${pedidoId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comentario,
              tipo: "cliente",
            }),
          }
        );

        if (response.ok) {
          await fetchPedidos();
          setSuccessMessage("Comentario del cliente guardado exitosamente.");
        } else {
          setErrorMessage("Error al guardar el comentario del cliente.");
        }
      } catch (error) {
        console.error("Error al guardar comentario del cliente:", error);
        setErrorMessage("Error al guardar el comentario del cliente.");
      }
    },
    [fetchPedidos, setSuccessMessage, setErrorMessage]
  );

  const handleComentarioProducto = useCallback(
    async (pedidoId: string, comentario: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/pedidos/${pedidoId}/comentario`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comentario,
              tipo: "producto",
            }),
          }
        );

        if (response.ok) {
          await fetchPedidos();
          setSuccessMessage("Comentario del producto guardado exitosamente.");
        } else {
          setErrorMessage("Error al guardar el comentario del producto.");
        }
      } catch (error) {
        console.error("Error al guardar comentario del producto:", error);
        setErrorMessage("Error al guardar el comentario del producto.");
      }
    },
    [fetchPedidos, setSuccessMessage, setErrorMessage]
  );

  // Filtrado y ordenamiento de datos
  const filteredPedidos = useMemo(() => {
    return pedidos
      .filter((pedido: any) =>
        visibleColumns.some(
          (col) =>
            col.visible &&
            pedido[col.key]?.toString().toLowerCase().includes(searchQuery)
        )
      )
      .filter((pedido: any) =>
        ocultarEntregados ? pedido.estado?.toLowerCase() !== "entregado" : true
      );
  }, [pedidos, visibleColumns, searchQuery, ocultarEntregados]);

  const sortedPedidos = useMemo(() => {
    if (!sortConfig.key) return filteredPedidos;

    return [...filteredPedidos].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      let comparison = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = aValue?.toString().localeCompare(bValue?.toString());
      }

      if (comparison === 0) {
        const remitoA = Number(a.remito) || 0;
        const remitoB = Number(b.remito) || 0;
        comparison = remitoB - remitoA;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredPedidos, sortConfig]);

  // Funciones de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPedidos.length / itemsPerPage);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      setCurrentPage(pageNumber);
    },
    [setCurrentPage]
  );

  // Calcular el siguiente número de remito
  const nextRemito = useMemo(() => {
    const maxRemito =
      pedidos.length > 0
        ? Math.max(...pedidos.map((pedido) => Number(pedido.remito) || 0))
        : 0;
    return maxRemito + 1;
  }, [pedidos]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {error && <ErrorModal message={error} onClose={() => {}} />}

      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden flex-1 flex flex-col">
        <TableHeader
          visibleColumns={visibleColumns}
          sortConfig={sortConfig}
          onSort={handleSort}
          onToggleColumn={toggleColumnVisibility}
          onNuevoPedido={() => setIsModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          ocultarEntregados={ocultarEntregados}
          onOcultarEntregadosChange={setOcultarEntregados}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto flex-1">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200">
                  {visibleColumns
                    .filter((col) => col.visible)
                    .map((col) => (
                      <th
                        key={col.key}
                        className={`text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                          col.key === "remito"
                            ? "w-20"
                            : col.key === "cantidadM2"
                            ? "w-16"
                            : col.key === "fecha"
                            ? "w-28"
                            : col.key === "detalle"
                            ? "w-40"
                            : col.key === "cliente"
                            ? "min-w-32 max-w-48"
                            : ""
                        }`}
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center gap-2">
                          {col.key === "remito" && (
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          )}
                          {col.key === "fecha" && (
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                          {col.key === "cliente" && (
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          )}
                          {col.key === "detalle" && (
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
                          )}
                          {col.key === "cantidadM2" && (
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
                          )}
                          {col.key === "materiales" && (
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
                          )}
                          {col.key === "total" && (
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
                          )}
                          {col.key === "total_pendiente" && (
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
                          )}
                          {col.key === "estado" && (
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
                          )}
                          {col.key === "disponible" && (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {col.key === "acciones" && (
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
                          )}
                          {col.label}
                          {sortConfig.key === col.key && (
                            <span className="text-primary">
                              {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row: any, rowIndex) => {
                  const isExpanded = expandedRows.includes(row.remito);
                  const tieneMasDeUnProducto = row.masDeUnProducto;

                  return (
                    <React.Fragment key={rowIndex}>
                      <tr
                        className={`hover:bg-base-200 transition-colors duration-200 ${
                          tieneMasDeUnProducto ? "cursor-pointer" : ""
                        }`}
                        onClick={() =>
                          tieneMasDeUnProducto && toggleExpand(row.remito)
                        }
                      >
                        {visibleColumns
                          .filter((col) => col.visible)
                          .map((col) =>
                            col.key === "acciones" ? (
                              <td
                                key={col.key}
                                className="px-2 py-1 sm:px-4 sm:py-2"
                              >
                                <RowActions
                                  row={row}
                                  onRemitir={setRemitoData}
                                  onEditar={handleEditar}
                                  onCambiarEstado={cambiarEstado}
                                  onEliminar={eliminarPedido}
                                  onVerComprobante={verComprobante}
                                  onComentarioCliente={handleComentarioClick}
                                  onComentarioProducto={handleComentarioClick}
                                />
                              </td>
                            ) : (
                              <TableCell
                                key={col.key}
                                col={col}
                                row={row}
                                isExpanded={isExpanded}
                                tieneMasDeUnProducto={tieneMasDeUnProducto}
                              />
                            )
                          )}
                      </tr>

                      {isExpanded &&
                        row.productos
                          ?.slice(1)
                          .map((prod: any, prodIndex: number) => (
                            <tr
                              key={`extra-${rowIndex}-${prodIndex}`}
                              className="bg-base-200 text-sm"
                            >
                              {visibleColumns
                                .filter((col) => col.visible)
                                .map((col) => {
                                  if (col.key === "acciones") {
                                    return (
                                      <td
                                        key={col.key}
                                        className="px-2 py-1 sm:px-4 sm:py-2 italic text-gray-500"
                                      ></td>
                                    );
                                  }

                                  let content = "";

                                  switch (col.key) {
                                    case "detalle":
                                      content = prod.modelo || "Sin modelo";
                                      break;
                                    case "cantidadM2":
                                      content = prod.cantidad;
                                      break;
                                    case "materiales":
                                      content =
                                        prod.materiales || "Sin materiales";
                                      break;
                                    case "valorM2":
                                      content = `$${Number(
                                        prod.valorM2 || 0
                                      ).toFixed(2)}`;
                                      break;
                                    case "disponible":
                                      content =
                                        prod.estado_stock || "pendiente";
                                      break;
                                  }

                                  return (
                                    <td
                                      key={col.key}
                                      className="px-2 py-1 sm:px-4 sm:py-2 italic text-gray-500"
                                    >
                                      {content}
                                    </td>
                                  );
                                })}
                            </tr>
                          ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="bg-base-200 px-6 py-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-base-content/60">
                Mostrando {indexOfFirstItem + 1} a{" "}
                {Math.min(indexOfLastItem, sortedPedidos.length)} de{" "}
                {sortedPedidos.length} pedidos
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
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
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

      {remitoData && (
        <RemitoModal
          remitoData={remitoData}
          onClose={() => setRemitoData(null)}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NuevoPedido
          onClose={() => setIsModalOpen(false)}
          onPedidoCreado={handlePedidoCreado}
          remito={nextRemito}
          editarPedido={false}
        />
      </Modal>

      {pedidoParaEditar && (
        <Modal
          isOpen={!!pedidoParaEditar}
          onClose={() => setPedidoParaEditar(null)}
        >
          <NuevoPedido
            onClose={() => {
              setIsModalOpen(false);
              setPedidoParaEditar(null);
            }}
            onPedidoCreado={handlePedidoCreado}
            remito={nextRemito}
            editarPedido={true}
            pedido={pedidoParaEditar}
          />
        </Modal>
      )}

      <ConfirmActionModal
        isOpen={modalOpen}
        message={
          accionActual?.tipo === "eliminar"
            ? "¿Estás seguro de que deseas eliminar el pedido?"
            : "¿Estás seguro de que deseas marcar como entregado el pedido?"
        }
        onConfirm={ejecutarAccionConfirmada}
        onCancel={() => {
          setAccionActual(null);
          setModalOpen(false);
        }}
      />

      <ComentarioModal
        isOpen={showComentarioModal}
        onClose={() => setShowComentarioModal(false)}
        onSave={handleSaveComentario}
        titulo={`Comentario ${
          comentarioTipo === "cliente" ? "del Cliente" : "del Producto"
        }`}
        comentarioActual={comentarioActual}
      />
    </div>
  );
};

export default TablePedidos;
