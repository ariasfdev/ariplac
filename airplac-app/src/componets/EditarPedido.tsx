import React, { useState } from "react";
import { API_BASE_URL } from "../config";

const EditarPedido = ({ pedido, onClose }: any) => {
  const [formData, setFormData] = useState(pedido);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
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

      <label>Cliente:</label>
      <input
        type="text"
        value={formData.cliente}
        onChange={(e) => handleChange("cliente", e.target.value)}
        className="input input-bordered w-full mb-4"
      />

      <label>Dirección:</label>
      <input
        type="text"
        value={formData.direccion}
        onChange={(e) => handleChange("direccion", e.target.value)}
        className="input input-bordered w-full mb-4"
      />

      <label>Total:</label>
      <input
        type="number"
        value={formData.total}
        onChange={(e) => handleChange("total", e.target.value)}
        className="input input-bordered w-full mb-4"
      />

      <div className="flex justify-end gap-4 mt-4">
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
