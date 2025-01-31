import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import Modal from "./Modal";
import NuevoPedido from "./NuevoPedido";

const columns = [
  { key: "remito", label: "Remito", visible: true },
  { key: "fecha", label: "Fecha", visible: true },
  { key: "cliente", label: "Cliente", visible: true },
  { key: "direccion", label: "Dirección", visible: false },
  { key: "contacto", label: "Contacto", visible: false },
  { key: "detalle", label: "Detalle", visible: true },
  { key: "cantidadM2", label: "Cantidad M2", visible: true },
  { key: "materiales", label: "Materiales", visible: true },
  { key: "total", label: "Total", visible: true },
  { key: "estado", label: "Estado", visible: true },
];

const TablePedidos: React.FC = () => {
  const { pedidos, fetchPedidos, error } = useAppContext();
  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handlePedidoCreado = () => {
    fetchPedidos(); // Actualiza la lista de pedidos
    setIsModalOpen(false); // Cierra el modal
  };

  return (
    <div>
      {/* Menú para configurar columnas */}
      <div className="flex gap-4">
        <div className="dropdown dropdown-hover mb-4">
          <label tabIndex={0} className="btn btn-outline">
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
        <button
          className="btn btn-outline"
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo pedido
        </button>
      </div>

      {/* Mostrar errores */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Tabla */}
      <div className="overflow-x-auto relative">
        <table className="table-lg table-zebra w-full">
          <thead>
            <tr>
              {visibleColumns
                .filter((col) => col.visible)
                .map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {pedidos.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {visibleColumns
                  .filter((col) => col.visible)
                  .map((col) => (
                    <td key={col.key}>{row[col.key as keyof typeof row]}</td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NuevoPedido
          onClose={() => setIsModalOpen(false)}
          onPedidoCreado={handlePedidoCreado}
        />
      </Modal>
    </div>
  );
};

export default TablePedidos;
