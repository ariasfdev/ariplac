import React, { useState } from "react";
import { API_BASE_URL } from "../config";

const EditarPedido = ({ pedido, onClose }: any) => {
  console.log(pedido);
  const [activeSection, setActiveSection] = useState<number>(0);

  const normalizeValue = (key: string, value: any) => {
    if (
      typeof value === "string" &&
      ["total", "valorM2", "cantidadM2", "seña", "descuento", "flete"].includes(
        key
      )
    ) {
      return value.replace(/[^\d]/g, "");
    }
    return value ?? "";
  };

  const [formData, setFormData] = useState(() =>
    Object.keys(pedido).reduce((acc, key) => {
      acc[key] = normalizeValue(key, pedido[key]);
      return acc;
    }, {} as any)
  );

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: normalizeValue(field, value) });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pedidos/editar/${pedido.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert("Pedido actualizado con éxito");
        onClose();
      } else {
        alert("Error al actualizar el pedido");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error en la solicitud");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Pedido</h2>

      {/* Navegación por secciones */}
      <div className="flex justify-center mb-4">
        <button
          className={`btn ${
            activeSection === 1 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(1)}
        >
          Productos
        </button>
        <button
          className={`btn ${
            activeSection === 0 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(0)}
        >
          Cliente
        </button>
        <button
          className={`btn $   {
            activeSection === 2 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(2)}
        >
          Otros datos
        </button>
      </div>

      {/* Sección de Cliente */}
      {activeSection === 0 && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>Cliente:</label>
            <input
              type="text"
              value={formData.cliente}
              onChange={(e) => handleChange("cliente", e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label>Contacto:</label>
            <input
              type="text"
              value={formData.contacto}
              onChange={(e) => handleChange("contacto", e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label>Dirección:</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      )}

      {/* Sección de Detalles del Pedido */}
      {activeSection === 1 && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>Cantidad M2:</label>
            <input
              type="number"
              value={formData.cantidadM2}
              onChange={(e) =>
                handleChange("cantidadM2", Number(e.target.value))
              }
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label>Materiales:</label>
            <input
              type="text"
              value={formData.materiales}
              onChange={(e) => handleChange("materiales", e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label>Valor:</label>
            <input
              type="number"
              value={formData.valorM2}
              onChange={(e) => handleChange("valorM2", Number(e.target.value))}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label>Fecha:</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => handleChange("fecha", e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      )}

      {/* Sección de Información Adicional */}
      {activeSection === 2 && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label>Estado:</label>
            <select
              value={formData.estado}
              onChange={(e) => handleChange("estado", e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="pendiente">Pendiente</option>
              <option value="retira">Retira</option>
              <option value="enviado">Enviado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label>Pago:</label>
            <select
              value={formData.pago}
              onChange={(e) => handleChange("pago", e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>

          <div>
            <label>Total:</label>
            <input
              type="number"
              value={formData.total}
              onChange={(e) => handleChange("total", Number(e.target.value))}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label>Remito:</label>
            <input
              type="text"
              value={formData.remito}
              onChange={(e) => handleChange("remito", e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <button className="btn btn-outline" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default EditarPedido;
