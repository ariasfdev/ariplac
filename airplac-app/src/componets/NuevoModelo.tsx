import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";
import { FaRuler, FaHashtag } from "react-icons/fa";

interface Modelo {
  _id: string;
  producto: string;
  modelo: string;
  ancho: string;
  alto: string;
  tipo: string;
  placas_por_metro: number;
}

interface NuevoModeloProps {
  isOpen: boolean;
  onClose: () => void;
  modelo: Modelo | null;
  onSave: (modelo: Modelo) => Promise<void>;
}

const NuevoModelo: React.FC<NuevoModeloProps> = ({
  isOpen,
  onClose,
  modelo,
  onSave,
}) => {
  const initialModelo: Modelo = {
    _id: "",
    producto: "",
    modelo: "",
    ancho: "",
    alto: "",
    tipo: "",
    placas_por_metro: 1,
  };

  const [formData, setFormData] = useState<Modelo>(initialModelo);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (modelo) {
      setFormData(modelo);
    } else {
      setFormData(initialModelo);
    }
  }, [modelo]);

  const handleClose = () => {
    setFormData(initialModelo);
    onClose();
  };

  const handleChange = (field: keyof Modelo, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Validación: todos los campos obligatorios
  const validateForm = (): boolean => {
    // Verificar campos de texto
    if (!formData.modelo.trim()) {
      setErrorMessage("El campo 'Modelo' es obligatorio.");
      return false;
    }
    if (!formData.producto.trim()) {
      setErrorMessage("El campo 'Producto' es obligatorio.");
      return false;
    }
    if (!formData.ancho.trim()) {
      setErrorMessage("El campo 'Ancho' es obligatorio.");
      return false;
    }
    if (!formData.alto.trim()) {
      setErrorMessage("El campo 'Alto' es obligatorio.");
      return false;
    }
    if (!formData.tipo.trim()) {
      setErrorMessage("El campo 'Tipo' es obligatorio.");
      return false;
    }

    // Verificar campos numéricos (que sean > 0)
    if (!formData.placas_por_metro || formData.placas_por_metro <= 0) {
      setErrorMessage("Las 'Placas por metro' deben ser mayor a 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      handleClose();
    } catch (error: any) {
      console.error("Error al guardar el modelo:", error);
      console.log("Error status directo:", error?.status);
      console.log("Error response status:", error?.response?.status);
      console.log("Response data:", error?.response?.data);
      
      // Verificar si es un error de duplicado (409 Conflict)
      if (error?.status === 409 || error?.response?.status === 409) {
        console.log("✅ Detectado error 409 - Mostrando mensaje de duplicado");
        setErrorMessage(
          `No se puede crear el modelo "${formData.modelo}" porque ya existe uno con el mismo nombre. Por favor, elige un nombre diferente.`
        );
      } else if (error?.response?.data?.message) {
        console.log("📝 Usando mensaje del servidor");
        setErrorMessage(error.response.data.message);
      } else if (error?.message) {
        console.log("⚠️ Usando mensaje general del error");
        setErrorMessage(error.message);
      } else {
        console.log("❌ Usando mensaje genérico");
        setErrorMessage("Ocurrió un error al guardar el modelo. Por favor, inténtalo nuevamente.");
      }
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
            {formData._id ? "Editar Modelo" : "Nuevo Modelo"}
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <button
              className={`btn w-full md:w-auto ${
                activeSection === 0 ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveSection(0)}
            >
              Información Básica
            </button>
            <button
              className={`btn w-full md:w-auto ${
                activeSection === 1 ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveSection(1)}
            >
              Dimensiones
            </button>
          </div>

          {/* Sección de Información Básica */}
          {activeSection === 0 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Información Básica
              </h3>

              <label className="block mb-2">Modelo:</label>
              <input
                type="text"
                className="input input-bordered w-full mb-4"
                value={formData.modelo}
                onChange={(e) => handleChange("modelo", e.target.value)}
                placeholder="Ej: Placa 12mm"
              />

              <label className="block mb-2">Producto:</label>
              <select
                className="select select-bordered w-full mb-4"
                value={formData.producto}
                onChange={(e) => handleChange("producto", e.target.value)}
              >
                <option value="" disabled>
                  Seleccionar producto
                </option>
                <option value="PLACAS">PLACAS</option>
                <option value="WPC">WPC</option>
                <option value="SIMIL_MARMOL">SIMIL_MARMOL</option>
                <option value="ZOCALOS_PVC">ZOCALOS_PVC</option>
                <option value="PVC_BLANCO">PVC_BLANCO</option>
                <option value="PVC_COLOR">PVC_COLOR</option>
                <option value="PVC_PERFIL">PVC_PERFIL</option>
                <option value="MATERIAL">MATERIAL</option>
                <option value="INSTALACION">INSTALACION</option>
                <option value="TELGOPOR">TELGOPOR</option>
                <option value="PERFIL_GALVANIZADO">PERFIL_GALVANIZADO</option>
                <option value="WPC_EXTERIOR">WPC_EXTERIOR</option>
              </select>

              <label className="block mb-2">Color:</label>
              <input
                type="text"
                className="input input-bordered w-full mb-4"
                value={formData.tipo}
                onChange={(e) => handleChange("tipo", e.target.value)}
                placeholder="Ej: Estándar, Premium, etc."
              />

              <div className="flex items-center gap-2 mb-2">
                <label className="block">Cantidad por metro:</label>
                <div
                  className="tooltip tooltip-right z-[9999]"
                  data-tip="Cantidad de placas necesarias por metro cuadrado"
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
                <FaHashtag
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
                  value={formData.placas_por_metro || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "placas_por_metro",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="1"
                />
              </div>
            </div>
          )}

          {/* Sección de Dimensiones */}
          {activeSection === 1 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Dimensiones
              </h3>

              <label className="block mb-2">Ancho:</label>
              <div className="relative mb-4">
                <FaRuler
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
                  value={formData.ancho}
                  onChange={(e) => handleChange("ancho", e.target.value)}
                  placeholder="Ej: 1.20m"
                />
              </div>

              <label className="block mb-2">Alto:</label>
              <div className="relative mb-4">
                <FaRuler
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
                  value={formData.alto}
                  onChange={(e) => handleChange("alto", e.target.value)}
                  placeholder="Ej: 2.40m"
                />
              </div>

              <div className="bg-base-300 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Resumen del Modelo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Modelo:</span>{" "}
                    {formData.modelo || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium">Producto:</span>{" "}
                    {formData.producto || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>{" "}
                    {formData.tipo || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium">Placas/m²:</span>{" "}
                    {formData.placas_por_metro || "No especificado"}
                  </div>
                  <div>
                    <span className="font-medium">Dimensiones:</span>{" "}
                    {formData.ancho && formData.alto
                      ? `${formData.ancho} x ${formData.alto}`
                      : "No especificadas"}
                  </div>
                </div>
              </div>
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

export default NuevoModelo;
