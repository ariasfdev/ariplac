import React, { useState } from "react";

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
  const [cantidad, setCantidad] = useState<number>(0);
  const [responsable, setResponsable] = useState<string>("");

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
          <input
            type="number"
            className="input input-bordered w-full mb-4"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block mb-2">Responsable:</label>
          <input
            type="text"
            className="input input-bordered w-full mb-4"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
          />
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
