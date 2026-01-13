import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";
import ConfirmActionModal from "./ConfirmActionModal";
import { FaDollarSign, FaPercent, FaTrash } from "react-icons/fa";
import axios from "axios";
import { API_BASE_URL } from "../config";

interface ModificarPrecioProps {
  isOpen: boolean;
  onClose: () => void;
  precio: Precio | null;
  onSave: (precio: any) => Promise<void>;
  modelo: any; // Modelo seleccionado
}

interface Precio {
  _id: string;
  id_modelo: string;
  nombre_precio: string;
  es_base: boolean;
  activo: boolean;
  costo: number | undefined;
  porcentaje_ganancia: number | undefined;
  porcentaje_tarjeta: number | undefined;
  total_redondeo: number | undefined;
  fecha: Date;
  precio: number | undefined;
}

const ModificarPrecio: React.FC<ModificarPrecioProps> = ({
  isOpen,
  onClose,
  precio,
  onSave,
  modelo,
}) => {
  const initialPrecio: Precio = {
    _id: "",
    id_modelo: modelo?._id || "",
    nombre_precio: "",
    es_base: false,
    activo: true,
    costo: undefined,
    porcentaje_ganancia: undefined,
    porcentaje_tarjeta: undefined,
    total_redondeo: undefined,
    fecha: new Date(),
    precio: undefined,
  };

  const [formData, setFormData] = useState<Precio>(initialPrecio);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [precioCalculado, setPrecioCalculado] = useState({
    precioBase: 0,
    precioConTarjeta: 0,
  });
  const [preciosExistentes, setPreciosExistentes] = useState<Precio[]>([]);
  const [isNuevoPrecio, setIsNuevoPrecio] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [precioToDelete, setPrecioToDelete] = useState<Precio | null>(null);
  const [ganancia, setGanancia] = useState<number | undefined>(undefined);
  const [gananciaInput, setGananciaInput] = useState<string>("");

  useEffect(() => {
    if (modelo?._id) {
      obtenerPrecios();
    }
  }, [modelo, isOpen]);

  // Resetear estado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialPrecio);
      setActiveSection(0);
      setErrorMessage("");
      setSuccessMessage("");
      setGanancia(undefined);
      setGananciaInput("");
    }
  }, [isOpen]);

  // Calcular precios cuando cambian los valores
  useEffect(() => {
    const calcularPrecios = () => {
      const costo = formData.costo || 0;
      const ganancia = (formData.porcentaje_ganancia || 0) / 100;
      const redondeo = formData.total_redondeo || 0;
      const tarjeta = (formData.porcentaje_tarjeta || 0) / 100;

      const precioBase = costo * (1 + ganancia) + redondeo;
      const precioConTarjeta = precioBase * (1 + tarjeta);

      setPrecioCalculado({
        precioBase: Number(precioBase.toFixed(2)),
        precioConTarjeta: Number(precioConTarjeta.toFixed(2)),
      });
    };

    calcularPrecios();
  }, [
    formData.costo,
    formData.porcentaje_ganancia,
    formData.total_redondeo,
    formData.porcentaje_tarjeta,
  ]);

  const handleClose = () => {
    setFormData(initialPrecio);
    setActiveSection(0);
    setErrorMessage("");
    setSuccessMessage("");
    setPreciosExistentes([]);
    setIsNuevoPrecio(false);
    setShowDeleteModal(false);
    setPrecioToDelete(null);
    onClose();
  };

  const handleChange = (field: keyof Precio, value: any) => {
    setFormData({ ...formData, [field]: value });

    // Si cambia el costo o % ganancia, recalcular ganancia
    if (field === "costo" || field === "porcentaje_ganancia") {
      const costo = field === "costo" ? value || 0 : formData.costo || 0;
      const porcentaje =
        field === "porcentaje_ganancia"
          ? value || 0
          : formData.porcentaje_ganancia || 0;

      if (costo > 0 && porcentaje > 0) {
        const gananciaCalculada = (costo * porcentaje) / 100;
        setGanancia(gananciaCalculada);
        setGananciaInput(
          `$${gananciaCalculada.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        );
      } else {
        setGanancia(undefined);
        setGananciaInput("");
      }
    }
  };

  const handleGananciaChange = (value: number | undefined) => {
    setGanancia(value);

    // Calcular % ganancia basado en ganancia y costo
    if (
      value !== undefined &&
      value > 0 &&
      formData.costo &&
      formData.costo > 0
    ) {
      const porcentajeCalculado = (value / formData.costo) * 100;
      setFormData({
        ...formData,
        porcentaje_ganancia: Number(porcentajeCalculado.toFixed(2)),
      });
    } else if (value === undefined || value === 0) {
      setFormData({ ...formData, porcentaje_ganancia: undefined });
    }
  };

  // Obtener precios existentes del modelo
  const obtenerPrecios = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/stock/precios/${modelo.idModelo}`
      );
      setPreciosExistentes(response.data);
      console.log("Precios existentes:", response.data);

      // Buscar el precio base para cargarlo por defecto
      const precioBase = response.data.find(
        (p: Precio) => p.es_base && p.activo
      );

      if (precioBase) {
        // Si existe un precio base, cargarlo para editar
        setFormData(precioBase);
        setIsNuevoPrecio(false);
        // Calcular ganancia si hay costo y % ganancia
        if (precioBase.costo && precioBase.porcentaje_ganancia !== undefined) {
          const gananciaCalculada =
            (precioBase.costo * precioBase.porcentaje_ganancia) / 100;
          setGanancia(gananciaCalculada);
          setGananciaInput(
            `$${gananciaCalculada.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          );
        } else {
          setGanancia(undefined);
          setGananciaInput("");
        }
        console.log("Cargando precio base para editar:", precioBase);
      } else {
        // Si no existe precio base, crear uno nuevo
        setFormData({
          ...initialPrecio,
          id_modelo: modelo._id,
          nombre_precio: "Precio base",
          es_base: true, // El primer precio será base
        });
        setIsNuevoPrecio(true);
        setGanancia(undefined);
        setGananciaInput("");
        console.log("Creando nuevo precio base");
      }
    } catch (error) {
      console.error("Error al obtener precios:", error);
    }
  };
  const validateForm = (): boolean => {
    if (!formData.nombre_precio.trim()) {
      setErrorMessage("El campo 'Nombre del precio' es obligatorio.");
      return false;
    }

    if (!formData.costo || formData.costo <= 0) {
      setErrorMessage("El 'Costo' debe ser mayor a 0.");
      return false;
    }

    if (
      formData.porcentaje_ganancia === undefined ||
      formData.porcentaje_ganancia < 0
    ) {
      setErrorMessage(
        "El 'Porcentaje de ganancia' debe ser mayor o igual a 0."
      );
      return false;
    }

    if (
      formData.porcentaje_tarjeta === undefined ||
      formData.porcentaje_tarjeta < 0
    ) {
      setErrorMessage("El 'Porcentaje de tarjeta' debe ser mayor o igual a 0.");
      return false;
    }

    if (formData.total_redondeo === undefined || formData.total_redondeo < 0) {
      setErrorMessage("El 'Total redondeo' debe ser mayor o igual a 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Asignar el precio calculado
      formData.precio = precioCalculado.precioConTarjeta;

      // Preparar el array de precios para enviar
      const preciosParaEnviar: any[] = preciosExistentes.map((precio) => {
        // Si es el precio que estamos editando, usar los datos del formulario
        if (precio._id === formData._id) {
          return {
            _id: precio._id,
            nombre_precio: formData.nombre_precio,
            es_base: formData.es_base,
            activo: formData.activo,
            costo: formData.costo,
            porcentaje_ganancia: formData.porcentaje_ganancia,
            porcentaje_tarjeta: formData.porcentaje_tarjeta,
            total_redondeo: formData.total_redondeo,
          };
        }
        // Si no es el precio que estamos editando, mantener los datos originales
        return {
          _id: precio._id,
          nombre_precio: precio.nombre_precio,
          es_base: precio.es_base,
          activo: precio.activo,
          costo: precio.costo,
          porcentaje_ganancia: precio.porcentaje_ganancia,
          porcentaje_tarjeta: precio.porcentaje_tarjeta,
          total_redondeo: precio.total_redondeo,
        };
      });

      // Si es un nuevo precio, agregarlo al array
      if (isNuevoPrecio) {
        preciosParaEnviar.push({
          nombre_precio: formData.nombre_precio,
          es_base: formData.es_base,
          activo: formData.activo,
          costo: formData.costo,
          porcentaje_ganancia: formData.porcentaje_ganancia,
          porcentaje_tarjeta: formData.porcentaje_tarjeta,
          total_redondeo: formData.total_redondeo,
        });
      }

      // Enviar todos los precios al backend
      const payload = {
        precios: preciosParaEnviar,
      };

      await onSave(payload);

      // Recargar precios existentes
      await obtenerPrecios();

      // Limpiar estado después de guardar exitosamente
      setFormData(initialPrecio);
      setActiveSection(0);
      setErrorMessage("");
      setSuccessMessage("");
      setIsNuevoPrecio(false);
    } catch (error) {
      console.error("Error al guardar el precio:", error);
      setErrorMessage("Ocurrió un error al guardar el precio.");
    }
  };

  const handleSubmitAndContinue = async () => {
    if (!validateForm()) return;

    try {
      // Asignar el precio calculado
      formData.precio = precioCalculado.precioConTarjeta;

      // Preparar el array de precios para enviar
      const preciosParaEnviar: any[] = preciosExistentes.map((precio) => {
        // Si es el precio que estamos editando, usar los datos del formulario
        if (precio._id === formData._id) {
          return {
            _id: precio._id,
            nombre_precio: formData.nombre_precio,
            es_base: formData.es_base,
            activo: formData.activo,
            costo: formData.costo,
            porcentaje_ganancia: formData.porcentaje_ganancia,
            porcentaje_tarjeta: formData.porcentaje_tarjeta,
            total_redondeo: formData.total_redondeo,
          };
        }
        // Si no es el precio que estamos editando, mantener los datos originales
        return {
          _id: precio._id,
          nombre_precio: precio.nombre_precio,
          es_base: precio.es_base,
          activo: precio.activo,
          costo: precio.costo,
          porcentaje_ganancia: precio.porcentaje_ganancia,
          porcentaje_tarjeta: precio.porcentaje_tarjeta,
          total_redondeo: precio.total_redondeo,
        };
      });

      // Si es un nuevo precio, agregarlo al array
      if (isNuevoPrecio) {
        preciosParaEnviar.push({
          nombre_precio: formData.nombre_precio,
          es_base: formData.es_base,
          activo: formData.activo,
          costo: formData.costo,
          porcentaje_ganancia: formData.porcentaje_ganancia,
          porcentaje_tarjeta: formData.porcentaje_tarjeta,
          total_redondeo: formData.total_redondeo,
        });
      }

      // Enviar todos los precios al backend directamente
      const payload = {
        precios: preciosParaEnviar,
      };

      await axios.put(
        `${API_BASE_URL}/stock/precios/${modelo.idModelo}`,
        payload
      );

      // Recargar precios existentes
      await obtenerPrecios();

      // Mostrar mensaje de éxito sin cerrar el modal
      setSuccessMessage("Precios guardados exitosamente.");
      setIsNuevoPrecio(false);
    } catch (error) {
      console.error("Error al guardar el precio:", error);
      setErrorMessage("Ocurrió un error al guardar el precio.");
    }
  };

  const handleDeletePrecio = async () => {
    if (!precioToDelete) return;

    try {
      await axios.put(
        `${API_BASE_URL}/stock/precios/${precioToDelete._id}/baja`
      );

      // Recargar precios existentes después de eliminar
      await obtenerPrecios();

      // Si el precio eliminado era el que estaba en el formulario, resetear el formulario
      if (formData._id === precioToDelete._id) {
        setFormData(initialPrecio);
        setIsNuevoPrecio(false);
      }

      setSuccessMessage("Precio eliminado exitosamente.");
      setShowDeleteModal(false);
      setPrecioToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el precio:", error);
      setErrorMessage("Ocurrió un error al eliminar el precio.");
      setShowDeleteModal(false);
      setPrecioToDelete(null);
    }
  };

  const openDeleteModal = (precio: Precio) => {
    setPrecioToDelete(precio);
    setShowDeleteModal(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="bg-base-200 p-4 rounded-lg">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            {isNuevoPrecio ? "Nuevo Precio Base" : "Editar Precio Base"} -{" "}
            {modelo?.modelo}
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <button
              className={`btn w-full md:w-auto ${
                activeSection === 0 ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveSection(0)}
            >
              Información
            </button>
            <button
              className={`btn w-full md:w-auto ${
                activeSection === 1 ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setActiveSection(1)}
            >
              Precio Final
            </button>
          </div>

          {/* Sección de Información */}
          {activeSection === 0 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Información del Precio
              </h3>

              <label className="block mb-2">Nombre del precio:</label>
              <input
                type="text"
                className="input input-bordered w-full mb-4"
                value={formData.nombre_precio}
                onChange={(e) => handleChange("nombre_precio", e.target.value)}
                placeholder="Ej: Precio normal, Promo 1, etc."
              />

              <label className="block mb-2">Costo:</label>
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
                    formData.costo
                      ? `$${formData.costo.toLocaleString("es-AR")}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    handleChange(
                      "costo",
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  placeholder="0"
                />
              </div>

              {/* Lista de precios existentes */}
              {preciosExistentes.filter((p) => p.activo).length > 0 && (
                <div className="mb-4 p-3 bg-base-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Precios existentes:</h4>
                  <div className="space-y-2">
                    {preciosExistentes
                      .filter((precio) => precio.activo)
                      .map((precio) => (
                        <div
                          key={precio._id}
                          className="flex items-center justify-between p-2 bg-base-200 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {precio.nombre_precio}
                            </span>
                            {precio.es_base && (
                              <span className="badge badge-primary badge-xs">
                                Base
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              ${precio.precio?.toLocaleString("es-AR") || "0"}
                            </span>
                            <button
                              className="btn btn-xs btn-outline"
                              onClick={() => {
                                setFormData(precio);
                                setIsNuevoPrecio(false);
                                // Calcular ganancia si hay costo y % ganancia
                                if (
                                  precio.costo &&
                                  precio.porcentaje_ganancia !== undefined
                                ) {
                                  const gananciaCalculada =
                                    (precio.costo *
                                      precio.porcentaje_ganancia) /
                                    100;
                                  setGanancia(gananciaCalculada);
                                  setGananciaInput(
                                    `$${gananciaCalculada.toLocaleString(
                                      "es-AR",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )}`
                                  );
                                } else {
                                  setGanancia(undefined);
                                  setGananciaInput("");
                                }
                              }}
                            >
                              Editar
                            </button>
                            {!precio.es_base && (
                              <button
                                className="btn btn-xs btn-error"
                                onClick={() => openDeleteModal(precio)}
                                title="Eliminar precio"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  <button
                    className="btn btn-sm btn-primary mt-3"
                    onClick={() => {
                      setFormData({
                        ...initialPrecio,
                        id_modelo: modelo._id,
                        nombre_precio: "Nuevo precio",
                        es_base: false,
                      });
                      setIsNuevoPrecio(true);
                      setGanancia(undefined);
                      setGananciaInput("");
                    }}
                  >
                    + Agregar precio adicional
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sección Precio Final */}
          {activeSection === 1 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">
                Precio Final
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <label className="block">Ganancia:</label>
                <div
                  className="tooltip tooltip-right z-[9999]"
                  data-tip="Monto de ganancia en pesos. Se calculará automáticamente el porcentaje de ganancia."
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
                  value={gananciaInput}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, "");
                    setGananciaInput(value);
                    const numValue = value === "" ? undefined : Number(value);
                    handleGananciaChange(numValue);
                  }}
                  onBlur={() => {
                    // Formatear cuando pierde el foco
                    if (ganancia !== undefined && ganancia > 0) {
                      setGananciaInput(
                        `$${ganancia.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      );
                    } else {
                      setGananciaInput("");
                    }
                  }}
                  onFocus={() => {
                    // Mostrar solo números cuando tiene foco
                    if (ganancia !== undefined && ganancia > 0) {
                      setGananciaInput(ganancia.toString());
                    } else {
                      setGananciaInput("");
                    }
                  }}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <label className="block">Porcentaje de ganancia:</label>
                <div
                  className="tooltip tooltip-right z-[9999]"
                  data-tip="Se aplica al costo como margen de ganancia"
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
                    formData.porcentaje_ganancia !== undefined
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
                    formData.porcentaje_tarjeta !== undefined
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
                  data-tip="Se suma al precio final (costo + % ganancia)"
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
                    formData.total_redondeo !== undefined
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

              <div className="bg-base-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  Resumen de precios calculados:
                </h4>
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Tipo</th>
                      <th className="border border-gray-300 px-4 py-2">
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border border-gray-300">
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        Precio base
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        $
                        {precioCalculado.precioBase.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr className="border border-gray-300">
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        Con tarjeta
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        $
                        {precioCalculado.precioConTarjeta.toLocaleString(
                          "es-AR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
              className="btn btn-outline btn-primary w-full md:w-auto"
              onClick={handleSubmitAndContinue}
            >
              Guardar y continuar
            </button>
            <button
              className="btn btn-primary w-full md:w-auto"
              onClick={handleSubmit}
            >
              Guardar y cerrar
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

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmActionModal
        isOpen={showDeleteModal}
        message={`¿Estás seguro de que deseas eliminar el precio "${precioToDelete?.nombre_precio}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDeletePrecio}
        onCancel={() => {
          setShowDeleteModal(false);
          setPrecioToDelete(null);
        }}
      />

      {/* Modal de Éxito - Al final para que se muestre encima */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </>
  );
};

export default ModificarPrecio;
