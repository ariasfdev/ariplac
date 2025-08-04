import React, { useState, useEffect } from "react";
import Modal from "../componets/Modal"; // Ajusta la ruta a tu Modal
import ErrorModal from "../componets/ErrorModal"; // Ajusta la ruta a tu ErrorModal
import SuccessModal from "./SuccessModal";
import { FaDollarSign, FaPercent } from "react-icons/fa";

interface NuevoStockProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onSave: (stock: any) => Promise<void>;
  modelos: any[]; // Cambia a un tipo más específico si lo tienes
}

interface Stock {
  _id: string;
  producto: string;
  modelo: string;
  idModelo?: string;
  stock: number | undefined;
  unidad: string;
  produccion_diaria: number | undefined;
  valor: number | undefined; // Obligatorio > 0
  promo1: number | undefined; // Obligatorio > 0
  promo2: number | undefined; // Obligatorio > 0
  promo3: number | undefined; // Obligatorio > 0
  precio: number | undefined;
  precio_promo1: number | undefined;
  precio_promo2: number | undefined;
  precio_promo3: number | undefined;
  stockActivo: boolean;
  porcentaje_ganancia: number | undefined;
  porcentaje_tarjeta: number | undefined;
  total_redondeo: number | undefined;
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
    stock: undefined,
    unidad: "",
    produccion_diaria: undefined,
    valor: undefined,
    promo1: undefined,
    promo2: undefined,
    promo3: undefined,
    precio: undefined,
    precio_promo1: undefined,
    precio_promo2: undefined,
    precio_promo3: undefined,
    stockActivo: true,
    porcentaje_ganancia: undefined,
    porcentaje_tarjeta: undefined,
    total_redondeo: undefined,
  };

  const [formData, setFormData] = useState<Stock>(initialStock);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [totales, setTotales] = useState({
    soloM2: 0,
    conMateriales: 0,
    conPegamento: 0,
    conSellaJunta: 0,
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (stock) {
      setFormData(stock);
    } else {
      setFormData(initialStock);
    }
  }, [stock, isOpen]);

  // Resetear estado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialStock);
      setActiveSection(0);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  // Manejar cambios en el stock cuando el modal está abierto
  useEffect(() => {
    if (isOpen && stock) {
      setFormData(stock);
    }
  }, [stock, isOpen]);

  const handleClose = () => {
    setFormData(initialStock);
    setActiveSection(0);
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };
  useEffect(() => {
    const calcularTotales = () => {
      const calcularTotal = (valorBase: number) => {
        valorBase = valorBase;
        const ganancia = (formData.porcentaje_ganancia || 0) / 100;
        return (
          1 * (valorBase + valorBase * ganancia) +
          (formData.total_redondeo || 0)
        );
      };

      setTotales({
        soloM2: calcularTotal(formData.valor || 0),
        conMateriales: calcularTotal(formData.promo1 || 0),
        conPegamento: calcularTotal(formData.promo2 || 0),
        conSellaJunta: calcularTotal(formData.promo3 || 0),
      });
    };

    calcularTotales();
  }, [formData]);

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
    // Solo validar stock > 0 si es un nuevo stock (sin _id) o si el stock actual es 0
    if (!formData._id && (!formData.stock || formData.stock <= 0)) {
      setErrorMessage(
        "La 'Cantidad Actual' debe ser mayor a 0 para nuevos stocks."
      );
      return false;
    }
    if (!formData.produccion_diaria || formData.produccion_diaria <= 0) {
      setErrorMessage("La 'Producción Diaria' debe ser mayor a 0.");
      return false;
    }

    // Todos los campos de costo son obligatorios y deben ser > 0
    if (!formData.valor || formData.valor <= 0) {
      setErrorMessage("El 'Valor' debe ser mayor a 0.");
      return false;
    }
    if (!formData.promo1 || formData.promo1 <= 0) {
      setErrorMessage("El 'Valor promo1' debe ser mayor a 0.");
      return false;
    }
    if (!formData.promo2 || formData.promo2 <= 0) {
      setErrorMessage("El 'Valor promo2' debe ser mayor a 0.");
      return false;
    }
    if (!formData.promo3 || formData.promo3 <= 0) {
      setErrorMessage("El 'Valor promo3' debe ser mayor a 0.");
      return false;
    }
    // Los campos de porcentaje y redondeo son opcionales, solo validar si están presentes
    if (
      formData.porcentaje_ganancia !== undefined &&
      formData.porcentaje_ganancia <= 0
    ) {
      setErrorMessage("El 'Porcentaje ganancia' debe ser mayor a 0.");
      return false;
    }
    if (formData.total_redondeo !== undefined && formData.total_redondeo <= 0) {
      setErrorMessage("El 'Total redondeo' debe ser mayor a 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      formData.precio = totales.soloM2;
      formData.precio_promo1 = totales.conMateriales;
      formData.precio_promo2 = totales.conPegamento;
      formData.precio_promo3 = totales.conSellaJunta;
      console.log(formData);
      await onSave(formData);
      // Limpiar estado después de guardar exitosamente
      setFormData(initialStock);
      setActiveSection(0);
      setErrorMessage("");
      setSuccessMessage("");
      onClose();
    } catch (error) {
      console.error("Error al guardar el stock:", error);
      setErrorMessage("Ocurrió un error al guardar el stock.");
    }
  };

  return (
    <>
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
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
            <button
              className={`btn w-full md:w-auto ${
                activeSection === 2 ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveSection(2)}
            >
              Precio Final
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
                <option value="Servicio de instalacion">
                  Servicio de instalacion
                </option>
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

              <label className="block mb-2">
                Cantidad Actual:
                {(formData.stock || 0) > 0 && formData.stockActivo && (
                  <span className="ml-2 text-xs text-orange-600 font-medium">
                    (Bloqueado)
                  </span>
                )}
              </label>
              <input
                type="number"
                className={`input input-bordered w-full mb-4 ${
                  (formData.stock || 0) > 0 && formData.stockActivo
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                value={formData.stock || ""}
                onChange={(e) =>
                  handleChange(
                    "stock",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                disabled={(formData.stock || 0) > 0 && formData.stockActivo}
              />
              {(formData.stock || 0) > 0 && formData.stockActivo && (
                <p className="text-sm text-orange-600 mb-2">
                  ⚠️ No se puede editar la cantidad actual cuando hay stock
                  disponible. Use "Agregar Stock" para modificar la cantidad.
                </p>
              )}

              <label className="block mb-2">Unidad:</label>
              <select
                className="select select-bordered w-full mb-4"
                value={formData.unidad}
                onChange={(e) => handleChange("unidad", e.target.value)}
              >
                <option value="" disabled>
                  Seleccionar unidad
                </option>
                <option value="M2">M2</option>
                <option value="ML">ML</option>
                <option value="UNIDAD">UNIDAD</option>
              </select>

              <label className="block mb-2">Producción Diaria:</label>
              <input
                type="number"
                className="input input-bordered w-full mb-4"
                value={formData.produccion_diaria || ""}
                onChange={(e) =>
                  handleChange(
                    "produccion_diaria",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
              />
            </div>
          )}

          {/* Sección de Costo */}
          {activeSection === 1 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">Costo</h3>
              <label className="block mb-2">Valor:</label>
              <div className="relative mb-4">
                <FaDollarSign
                  className="
                    absolute 
                    left-3 
                    top-1/2 
                    transform -translate-y-1/2 
                    w-4 h-4 
                    text-gray-500 
                    pointer-events-none
                  "
                />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={
                    formData.valor
                      ? `$${formData.valor.toLocaleString("es-AR")}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "valor",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>
              <label className="block mb-2">Valor promo1:</label>

              <div className="relative mb-4">
                <FaDollarSign
                  className="
      absolute 
      left-3 
      top-1/2 
      transform -translate-y-1/2 
      w-4 h-4 
      text-gray-500 
      pointer-events-none
    "
                />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={
                    formData.promo1
                      ? `$${formData.promo1.toLocaleString("es-AR")}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "promo1",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>
              <label className="block mb-2">Valor promo2:</label>
              <div className="relative mb-4">
                <FaDollarSign
                  className="
                    absolute 
                    left-3 
                    top-1/2 
                    transform -translate-y-1/2 
                    w-4 h-4 
                    text-gray-500 
                    pointer-events-none
                  "
                />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={
                    formData.promo2
                      ? `$${formData.promo2.toLocaleString("es-AR")}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "promo2",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>
              <label className="block mb-2">Valor promo3:</label>
              <div className="relative mb-4">
                <FaDollarSign
                  className="
                    absolute 
                    left-3 
                    top-1/2 
                    transform -translate-y-1/2 
                    w-4 h-4 
                    text-gray-500 
                    pointer-events-none
                  "
                />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={
                    formData.promo3
                      ? `$${formData.promo3.toLocaleString("es-AR")}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "promo3",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>
            </div>
          )}
          {/* Sección Precio Final */}
          {activeSection === 2 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Precio Final
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <label className="block">Porcentaje de ganancia:</label>
                <div
                  className="tooltip tooltip-right z-[9999]"
                  data-tip="Se aplica al precio total como margen de ganancia"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative mb-4">
                <FaPercent
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
                  value={
                    formData.porcentaje_ganancia
                      ? `${formData.porcentaje_ganancia}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "porcentaje_ganancia",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block">Porcentaje de tarjeta:</label>
                <div
                  className="tooltip tooltip-right z-[9999]"
                  data-tip="Se aplica al precio final como recargo por pago con tarjeta"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative mb-4">
                <FaPercent
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
                  value={
                    formData.porcentaje_tarjeta
                      ? `${formData.porcentaje_tarjeta}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "porcentaje_tarjeta",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="block">Total redondeo:</label>
                <div
                  className="tooltip tooltip-right z-[9999]"
                  data-tip="Se suma al precio final (total + % ganancia)"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative mb-4">
                <FaDollarSign
                  className="
                    absolute 
                    left-3 
                    top-1/2 
                    transform -translate-y-1/2 
                    w-4 h-4 
                    text-gray-500 
                    pointer-events-none
                  "
                />
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  value={
                    formData.total_redondeo
                      ? `$${formData.total_redondeo.toLocaleString("es-AR")}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "total_redondeo",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>

              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">
                      Valores
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Total</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Tarjeta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    "soloM2",
                    "conMateriales",
                    "conPegamento",
                    "conSellaJunta",
                  ].map((key) => (
                    <tr key={key} className="border border-gray-300">
                      <td className="border border-gray-300 px-4 py-2">
                        {key
                          .replace("soloM2", "Valor")
                          .replace("conMateriales", "Promo 1")
                          .replace("conPegamento", "Promo 2")
                          .replace("conSellaJunta", "Promo 3")}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        $
                        {totales[key as keyof typeof totales].toLocaleString(
                          "es-AR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        $
                        {(
                          totales[key as keyof typeof totales] *
                          (1 + (formData.porcentaje_tarjeta || 0) / 100)
                        ).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
