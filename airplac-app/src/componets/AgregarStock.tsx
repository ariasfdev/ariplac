import React, { useState } from "react";
import { FaBox, FaUser } from "react-icons/fa";

interface AgregarStockProps {
  isOpen: boolean;
  onClose: () => void;
  idStock: string;
  onSave: (cantidad: number, responsable: string) => void;
}

const AgregarStock: React.FC<AgregarStockProps> = ({
  isOpen,
  onClose,
  idStock,
  onSave,
}) => {
  const [cantidad, setCantidad] = useState<number | undefined>(undefined);
  const [responsable, setResponsable] = useState<string>("Agustin Fernandez");

  const handleSave = () => {
    if (!cantidad || !responsable) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    onSave(cantidad, responsable);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-base-200 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Agregar Stock</h2>
        <div>
          <label className="block mb-2">Cantidad:</label>
          <div className="relative mb-4">
            <FaBox
              className="
                absolute 
                left-3 
                top-1/2 
                transform -translate-y-1/2 
                w-3 h-3 
                text-gray-500 
                pointer-events-none
              "
            />
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              value={cantidad ? cantidad.toLocaleString("es-AR") : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, "");
                setCantidad(value === "" ? undefined : Number(value));
              }}
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2">Responsable:</label>
          <div className="relative mb-4">
            <FaUser
              className="
                absolute 
                left-3 
                top-1/2 
                transform -translate-y-1/2 
                w-3 h-3 
                text-gray-500 
                pointer-events-none
              "
            />
            <input
              type="text"
              className="input input-bordered w-full pl-10"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button className="btn btn-secondary" onClick={onClose}>
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

export default AgregarStock;
