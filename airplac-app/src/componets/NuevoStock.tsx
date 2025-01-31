import React, { useState, useEffect } from "react";
import Modal from "../componets/Modal";

interface NuevoStockProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onSave: (stock: Stock) => Promise<void>;
  modelos: string[];
}

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

const NuevoStock: React.FC<NuevoStockProps> = ({
  isOpen,
  onClose,
  stock,
  onSave,
  modelos,
}) => {
  const initialStock: Stock = {
    _id: "",
    producto: "",
    modelo: "",
    cantidad_actual: 0,
    unidad: "",
    produccion_diaria: 0,
    valor_m2: 0,
    valor_m2_materiales: 0,
    valor_m2_pegamento: 0,
    valor_m2_sella: 0,
    stockActivo: true,
  };

  const [formData, setFormData] = useState<Stock>(initialStock);
  const [activeSection, setActiveSection] = useState<number>(0); // 0: Stock, 1: Costo

  useEffect(() => {
    if (stock) {
      setFormData(stock); // Cargar datos del stock al abrir el modal para editar
    } else {
      setFormData(initialStock); // Resetear al valor inicial si no hay stock
    }
  }, [stock]);

  const handleClose = () => {
    setFormData(initialStock); // Limpia los datos del formulario
    onClose(); // Llama a la función para cerrar el modal
  };

  const handleChange = (
    field: keyof Stock,
    value: string | number | boolean
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    onSave(formData);
    handleClose(); // Asegúrate de cerrar el modal al guardar
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div>
        <h2 className="text-xl font-bold mb-4">
          {formData._id ? "Editar Stock" : "Nuevo Stock"}
        </h2>

        {/* Navegación por secciones */}
        <div className="flex gap-4 mb-4">
          <button
            className={`btn ${
              activeSection === 0 ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setActiveSection(0)}
          >
            Stock
          </button>
          <button
            className={`btn ${
              activeSection === 1 ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setActiveSection(1)}
          >
            Costo
          </button>
        </div>

        {/* Sección Stock */}
        {activeSection === 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Stock</h3>
            <label className="block mb-2">Producto:</label>
            <select
              className="select select-bordered w-full mb-4"
              value={formData.producto}
              onChange={(e) => handleChange("producto", e.target.value)}
              disabled={!!formData._id}
            >
              <option value="" disabled>
                Seleccionar producto
              </option>
              <option value="Placa de yeso">Placa de yeso</option>
              <option value="Placa de telgopor">Placa de telgopor</option>
            </select>

            <label className="block mb-2">Modelo:</label>
            <select
              className="select select-bordered w-full mb-4"
              value={formData.modelo}
              onChange={(e) => handleChange("modelo", e.target.value)}
              disabled={!!formData._id}
            >
              <option value="" disabled>
                Seleccionar modelo
              </option>
              {modelos.map((modelo) => (
                <option key={modelo} value={modelo}>
                  {modelo}
                </option>
              ))}
            </select>

            <label className="block mb-2">Cantidad Actual:</label>
            <input
              type="number"
              className="input input-bordered w-full mb-4"
              value={formData.cantidad_actual}
              disabled
            />

            <label className="block mb-2">Unidad:</label>
            <input
              type="text"
              className="input input-bordered w-full mb-4"
              value={formData.unidad}
              onChange={(e) => handleChange("unidad", e.target.value)}
            />

            <label className="block mb-2">Producción Diaria:</label>
            <input
              type="number"
              className="input input-bordered w-full mb-4"
              value={formData.produccion_diaria}
              onChange={(e) =>
                handleChange("produccion_diaria", Number(e.target.value))
              }
            />
          </div>
        )}

        {/* Sección Costo */}
        {activeSection === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Costo</h3>
            <label className="block mb-2">Valor M2 Materiales:</label>
            <input
              type="number"
              className="input input-bordered w-full mb-4"
              value={formData.valor_m2_materiales}
              onChange={(e) =>
                handleChange("valor_m2_materiales", Number(e.target.value))
              }
            />

            <label className="block mb-2">Valor M2 Pegamento:</label>
            <input
              type="number"
              className="input input-bordered w-full mb-4"
              value={formData.valor_m2_pegamento}
              onChange={(e) =>
                handleChange("valor_m2_pegamento", Number(e.target.value))
              }
            />

            <label className="block mb-2">Valor M2 Sella:</label>
            <input
              type="number"
              className="input input-bordered w-full mb-4"
              value={formData.valor_m2_sella}
              onChange={(e) =>
                handleChange("valor_m2_sella", Number(e.target.value))
              }
            />
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NuevoStock;
