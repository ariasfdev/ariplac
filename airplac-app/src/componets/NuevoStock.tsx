import React, { useState, useEffect } from "react";
import Modal from "../componets/Modal"; // Ajusta la ruta a tu Modal
import ErrorModal from "../componets/ErrorModal"; // Ajusta la ruta a tu ErrorModal

interface NuevoStockProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onSave: (stock: Stock) => Promise<void>;
  modelos: any[]; // Cambia a un tipo más específico si lo tienes
}

interface Stock {
  _id: string;
  producto: string;
  modelo: string;
  idModelo?: string;
  cantidad_actual: number;
  unidad: string;
  produccion_diaria: number;
  valor_m2: number; // Obligatorio > 0
  valor_m2_materiales: number; // Obligatorio > 0
  valor_m2_pegamento: number; // Obligatorio > 0
  valor_m2_sella: number; // Obligatorio > 0
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
    idModelo: "",
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
  const [activeSection, setActiveSection] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (stock) {
      setFormData(stock);
    } else {
      setFormData(initialStock);
    }
  }, [stock]);

  const handleClose = () => {
    setFormData(initialStock);
    onClose();
  };

  const handleChange = (field: keyof Stock, value: any) => {
    // Si se selecciona un modelo desde el combo, guarda modelo e idModelo
    if (field === "modelo" && typeof value === "object") {
      setFormData({
        ...formData,
        modelo: value.modelo,
        idModelo: value.idModelo,
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Validación: todos los campos obligatorios
  const validateForm = (): boolean => {
    // Verificar campos de texto
    if (!formData.producto.trim()) {
      setErrorMessage("El campo 'Producto' es obligatorio.");
      return false;
    }
    if (!formData.modelo.trim()) {
      setErrorMessage("El campo 'Modelo' es obligatorio.");
      return false;
    }
    if (!formData.idModelo?.trim()) {
      setErrorMessage("El campo 'idModelo' es obligatorio.");
      return false;
    }
    if (!formData.unidad.trim()) {
      setErrorMessage("El campo 'Unidad' es obligatorio.");
      return false;
    }

    // Verificar campos numéricos (que sean > 0)
    if (formData.cantidad_actual <= 0) {
      setErrorMessage("La 'Cantidad Actual' debe ser mayor a 0.");
      return false;
    }
    if (formData.produccion_diaria <= 0) {
      setErrorMessage("La 'Producción Diaria' debe ser mayor a 0.");
      return false;
    }

    // Todos los campos de costo son obligatorios y deben ser > 0
    if (formData.valor_m2 <= 0) {
      setErrorMessage("El 'Valor M2' debe ser mayor a 0.");
      return false;
    }
    if (formData.valor_m2_materiales <= 0) {
      setErrorMessage("El 'Valor M2 Materiales' debe ser mayor a 0.");
      return false;
    }
    if (formData.valor_m2_pegamento <= 0) {
      setErrorMessage("El 'Valor M2 Pegamento' debe ser mayor a 0.");
      return false;
    }
    if (formData.valor_m2_sella <= 0) {
      setErrorMessage("El 'Valor M2 Sella' debe ser mayor a 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error("Error al guardar el stock:", error);
      setErrorMessage("Ocurrió un error al guardar el stock.");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="bg-base-200 p-4 rounded-lg">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            {formData._id ? "Editar Stock" : "Nuevo Stock"}
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <button
              className={`btn w-full md:w-auto ${
                activeSection === 0 ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveSection(0)}
            >
              Stock
            </button>
            <button
              className={`btn w-full md:w-auto ${
                activeSection === 1 ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveSection(1)}
            >
              Costo
            </button>
          </div>

          {/* Sección de Stock */}
          {activeSection === 0 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">Stock</h3>

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
                <option value="Placa de PVC">Placa de PVC</option>
              </select>

              <label className="block mb-2">Modelo:</label>
              <select
                className="select select-bordered w-full mb-4"
                value={formData.modelo}
                onChange={(e) => {
                  const selectedModel = modelos.find(
                    (m: any) => m.modelo === e.target.value
                  );
                  if (selectedModel) {
                    handleChange("modelo", {
                      modelo: selectedModel.modelo,
                      idModelo: selectedModel._id,
                    });
                  }
                }}
                disabled={!!formData._id}
              >
                <option value="" disabled>
                  Seleccionar modelo
                </option>
                {modelos.map((m: any) => (
                  <option key={m._id} value={m.modelo}>
                    {m.modelo}
                  </option>
                ))}
              </select>

              <label className="block mb-2">Cantidad Actual:</label>
              <input
                type="number"
                className="input input-bordered w-full mb-4"
                value={formData.cantidad_actual}
                onChange={(e) =>
                  handleChange("cantidad_actual", Number(e.target.value))
                }
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

          {/* Sección de Costo */}
          {activeSection === 1 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">Costo</h3>

              <label className="block mb-2">Valor M2:</label>
              <input
                type="number"
                className="input input-bordered w-full mb-4"
                value={formData.valor_m2}
                onChange={(e) =>
                  handleChange("valor_m2", Number(e.target.value))
                }
              />

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

          <div className="flex flex-col md:flex-row justify-end gap-2 mt-6">
            <button
              className="btn btn-secondary w-full md:w-auto"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary w-full md:w-auto"
              onClick={handleSubmit}
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Error */}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
    </>
  );
};

export default NuevoStock;
