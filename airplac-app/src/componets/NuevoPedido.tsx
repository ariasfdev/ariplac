import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../config";
import ErrorModal from "./ErrorModal";

interface NuevoPedidoProps {
  onClose: () => void;
  onPedidoCreado: () => void;
  remito: number;
}

interface Producto {
  idStock: string;
  idModelo: string;
  cantidad: number;
  unidad: string;
  materiales: string; // "con materiales", "sin materiales", "con pegamento", "con sella junta"
  valor_m2: number;
  valor_m2_materiales: number;
  valor_m2_pegamento: number;
  valor_m2_sella: number;
}

const NuevoPedido: React.FC<NuevoPedidoProps> = ({
  onClose,
  onPedidoCreado,
  remito,
}) => {
  const { fetchPedidos } = useAppContext();

  const [stockData, setStockData] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);

  const [productos, setProductos] = useState<Producto[]>([
    {
      idStock: "",
      idModelo: "",
      cantidad: 0,
      unidad: "",
      materiales: "",
      valor_m2: 0,
      valor_m2_materiales: 0,
      valor_m2_pegamento: 0,
      valor_m2_sella: 0,
    },
  ]);

  const [cliente, setCliente] = useState({
    nombre: "",
    direccion: "",
    contacto: "",
  });

  const [otrosDatos, setOtrosDatos] = useState({
    estado: "",
    fecha_pedido: "",
    fecha_entrega_estimada: "",
    metodo_pago: "",
    procedencia: "",
    flete: 0,
    descuento: 0, // de 1 a 100
    adelanto: 0,
    total: 0,
  });

  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Cargar datos de stock
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/stock/`);
        setStockData(response.data.filter((item: any) => item.stockActivo));
      } catch (err) {
        console.error("Error al obtener datos del stock:", err);
      }
    };
    fetchStockData();
  }, []);

  /**
   * Recalcula el total cada vez que cambian:
   * - los productos
   * - otrosDatos.flete
   * - otrosDatos.descuento
   * - otrosDatos.adelanto
   */
  useEffect(() => {
    const subtotalProductos = productos.reduce((sum, prod) => {
      // Determinamos qué valor usar según la opción de "materiales"
      let valorBase = prod.valor_m2;
      if (prod.materiales === "con materiales") {
        valorBase = prod.valor_m2_materiales || 0;
      } else if (prod.materiales === "con pegamento") {
        valorBase = prod.valor_m2_pegamento || 0;
      } else if (prod.materiales === "con sella junta") {
        valorBase = prod.valor_m2_sella || 0;
      }
      return sum + prod.cantidad * valorBase;
    }, 0);

    // Subtotal incluyendo flete
    const subtotalConFlete = subtotalProductos + (otrosDatos.flete || 0);

    // Aplicar descuento (si otrosDatos.descuento = 10, significa 10% de descuento)
    const descuentoDecimal = (otrosDatos.descuento || 0) / 100;
    const totalConDescuento =
      subtotalConFlete - subtotalConFlete * descuentoDecimal;

    // Restar adelanto
    const totalFinal = totalConDescuento - (otrosDatos.adelanto || 0);

    // Guardar en estado (asegúrate de no permitir que sea negativo si no quieres)
    setCurrentTotal(totalFinal > 0 ? totalFinal : 0);
  }, [productos, otrosDatos]);

  // Añadir nuevo producto
  const agregarProducto = () => {
    setProductos((prev) => [
      ...prev,
      {
        idStock: "",
        idModelo: "",
        cantidad: 0,
        unidad: "",
        materiales: "",
        valor_m2: 0,
        valor_m2_materiales: 0,
        valor_m2_pegamento: 0,
        valor_m2_sella: 0,
      },
    ]);
    setActiveTab(productos.length);
  };

  // Eliminar producto
  const eliminarProducto = (index: number) => {
    const nuevosProductos = productos.filter((_, i) => i !== index);
    setProductos(nuevosProductos);

    if (index === activeTab && nuevosProductos.length > 0) {
      setActiveTab(index === 0 ? 0 : index - 1);
    } else if (nuevosProductos.length === 0) {
      setActiveTab(0);
    }
  };

  // Cambios en productos
  const handleProductoChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const nuevosProductos = [...productos];
    // Actualizar la propiedad
    (nuevosProductos[index] as any)[field] = value;
    setProductos(nuevosProductos);
  };

  // Cambios en cliente
  const handleClienteChange = (field: string, value: string) => {
    setCliente((prev) => ({ ...prev, [field]: value }));
  };

  // Cambios en otros datos
  const handleOtrosDatosChange = (field: string, value: string | number) => {
    setOtrosDatos((prev) => ({ ...prev, [field]: value }));
  };

  // Seleccionar un stock de la lista
  const handleStockSeleccionado = (index: number, idStock: string) => {
    const productoSeleccionado = stockData.find((item) => item._id === idStock);
    if (productoSeleccionado) {
      const nuevosProductos = [...productos];
      nuevosProductos[index] = {
        ...nuevosProductos[index],
        idStock: productoSeleccionado._id,
        idModelo: productoSeleccionado.idModelo,
        unidad: productoSeleccionado.unidad,
        // Ponemos los valores de precio disponibles
        valor_m2: productoSeleccionado.valor_m2 || 0,
        valor_m2_materiales: productoSeleccionado.valor_m2_materiales || 0,
        valor_m2_pegamento: productoSeleccionado.valor_m2_pegamento || 0,
        valor_m2_sella: productoSeleccionado.valor_m2_sella || 0,
        // Por defecto materiales = "" (o lo que corresponda)
        materiales: "",
      };
      setProductos(nuevosProductos);
    }
  };

  // Validación
  const validateForm = () => {
    if (
      !cliente.nombre.trim() ||
      !cliente.direccion.trim() ||
      !cliente.contacto.trim()
    ) {
      setErrorMessage(
        "Por favor, completa todos los campos obligatorios del cliente."
      );
      return false;
    }

    for (let i = 0; i < productos.length; i++) {
      const p = productos[i];
      if (!p.idStock || p.cantidad <= 0 || !p.unidad.trim() || !p.materiales) {
        setErrorMessage(
          `Por favor, completa todos los campos obligatorios del producto ${
            i + 1
          }.`
        );
        return false;
      }
    }

    if (
      !otrosDatos.metodo_pago ||
      !otrosDatos.procedencia ||
      !otrosDatos.estado
    ) {
      setErrorMessage(
        "Por favor, completa todos los campos obligatorios en la sección de Otros Datos."
      );
      return false;
    }
    return true;
  };

  // Al enviar el formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Vuelve a calcular el total final para enviar exactamente el mismo valor
    const subtotalProductos = productos.reduce((sum, prod) => {
      let valorBase = prod.valor_m2;
      if (prod.materiales === "con materiales") {
        valorBase = prod.valor_m2_materiales || 0;
      } else if (prod.materiales === "con pegamento") {
        valorBase = prod.valor_m2_pegamento || 0;
      } else if (prod.materiales === "con sella junta") {
        valorBase = prod.valor_m2_sella || 0;
      }
      return sum + prod.cantidad * valorBase;
    }, 0);

    const subtotalConFlete = subtotalProductos + otrosDatos.flete;
    const descuentoDecimal = (otrosDatos.descuento || 0) / 100;
    const totalConDescuento =
      subtotalConFlete - subtotalConFlete * descuentoDecimal;
    const totalFinal = totalConDescuento - otrosDatos.adelanto;
    const totalEnviado = totalFinal > 0 ? totalFinal : 0;

    const data = {
      remito,
      vendedor_id: "6790061fce76c812a9cb0ce2", // Ajusta según corresponda
      cliente,
      productos,
      estado: otrosDatos.estado,
      fecha_pedido: new Date().toISOString(),
      fecha_entrega_estimada: new Date().toISOString(),
      demora_calculada: 6,
      metodo_pago: otrosDatos.metodo_pago,
      procedencia: otrosDatos.procedencia,
      flete: otrosDatos.flete,
      descuento: otrosDatos.descuento,
      adelanto: otrosDatos.adelanto,
      total: totalEnviado,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/pedidos/`, data);
      console.log("Pedido creado con éxito:", response.data);
      fetchPedidos();
      onPedidoCreado();
      onClose();
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      setErrorMessage("Hubo un error al crear el pedido");
    }
  };

  return (
    <>
      {/* Título y total en Desktop */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-base-content">Nuevo Pedido</h2>
        {/* Total en desktop (oculto en mobile) */}
        <p className="hidden sm:block text-xl font-bold text-base-content pr-10">
          Total: ${currentTotal}
        </p>
      </div>

      {/* Total flotante en mobile (oculto en desktop) */}
      <div className="sm:hidden fixed top-2 right-2 text-sm font-bold text-base-content bg-base-200 p-2 rounded shadow z-50">
        Total: ${currentTotal}
      </div>

      {/* Tabs de secciones */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <button
          className={`btn w-full sm:w-auto ${
            activeSection === 0 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(0)}
        >
          Productos
        </button>
        <button
          className={`btn w-full sm:w-auto ${
            activeSection === 1 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(1)}
        >
          Cliente
        </button>
        <button
          className={`btn w-full sm:w-auto ${
            activeSection === 2 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(2)}
        >
          Otros Datos
        </button>
      </div>

      {/* Sección de Productos */}
      {activeSection === 0 && (
        <>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {productos.map((_, index) => (
              <div
                key={index}
                className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${
                  activeTab === index
                    ? "text-primary scale-110"
                    : "text-base-content opacity-50"
                }`}
                onClick={() => setActiveTab(index)}
                title={`Producto ${index + 1}`}
              >
                <FaShoppingCart size={activeTab === index ? 32 : 24} />
                {activeTab === index && (
                  <span className="text-xs font-bold mt-1">
                    Producto {index + 1}
                  </span>
                )}
                {activeTab === index && (
                  <button
                    className="absolute top-[-10px] right-[-10px] text-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarProducto(index);
                    }}
                  >
                    <IoCloseCircle size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary text-xs w-full sm:w-auto"
              onClick={agregarProducto}
            >
              + Agregar
            </button>
          </div>

          {productos.length > 0 ? (
            <div className="border rounded bg-base-200 p-4">
              <label className="block mb-2 text-base-content">
                Seleccionar Producto
              </label>
              <select
                className="select select-bordered w-full mb-4"
                value={productos[activeTab]?.idStock || ""}
                onChange={(e) =>
                  handleStockSeleccionado(activeTab, e.target.value)
                }
              >
                <option value="" disabled>
                  Seleccionar producto
                </option>
                {stockData.map((producto) => (
                  <option key={producto._id} value={producto._id}>
                    {producto.modelo} ({producto.producto})
                  </option>
                ))}
              </select>

              <label className="block mb-2 text-base-content">Cantidad</label>
              <input
                type="number"
                className="input input-bordered w-full mb-2"
                placeholder="Cantidad"
                value={productos[activeTab]?.cantidad || 0}
                onChange={(e) =>
                  handleProductoChange(
                    activeTab,
                    "cantidad",
                    Number(e.target.value)
                  )
                }
              />

              <label className="block mb-2 text-base-content">Unidad</label>
              <input
                type="text"
                className="input input-bordered w-full mb-2"
                placeholder="Unidad"
                value={productos[activeTab]?.unidad || ""}
                onChange={(e) =>
                  handleProductoChange(activeTab, "unidad", e.target.value)
                }
              />

              <label className="block mb-2 text-base-content">Materiales</label>
              <select
                className="select select-bordered w-full"
                value={productos[activeTab]?.materiales || ""}
                onChange={(e) =>
                  handleProductoChange(activeTab, "materiales", e.target.value)
                }
              >
                <option value="" disabled>
                  Seleccione una opción
                </option>
                <option value="sin materiales">Sin materiales</option>
                <option value="con materiales">Con materiales</option>
                <option value="con pegamento">Con pegamento</option>
                <option value="con sella junta">Con sella junta</option>
              </select>
            </div>
          ) : (
            <p className="text-center text-base-content opacity-50">
              No hay productos disponibles.
            </p>
          )}
        </>
      )}

      {/* Sección de Cliente */}
      {activeSection === 1 && (
        <div className="border rounded bg-base-200 p-4">
          <label className="block mb-2 text-base-content">Nombre</label>
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            value={cliente.nombre}
            onChange={(e) => handleClienteChange("nombre", e.target.value)}
          />

          <label className="block mb-2 text-base-content">Dirección</label>
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            value={cliente.direccion}
            onChange={(e) => handleClienteChange("direccion", e.target.value)}
          />

          <label className="block mb-2 text-base-content">Contacto</label>
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            value={cliente.contacto}
            onChange={(e) => handleClienteChange("contacto", e.target.value)}
          />
        </div>
      )}

      {/* Sección de Otros Datos */}
      {activeSection === 2 && (
        <div className="border rounded bg-base-200 p-4">
          <label className="block mb-2 text-base-content">Flete</label>
          <input
            type="number"
            className="input input-bordered w-full mb-2"
            value={otrosDatos.flete}
            onChange={(e) =>
              handleOtrosDatosChange("flete", Number(e.target.value))
            }
          />

          <label className="block mb-2 text-base-content">Descuento (%)</label>
          <input
            type="number"
            className="input input-bordered w-full mb-2"
            value={otrosDatos.descuento}
            onChange={(e) =>
              handleOtrosDatosChange("descuento", Number(e.target.value))
            }
          />

          <label className="block mb-2 text-base-content">Adelanto</label>
          <input
            type="number"
            className="input input-bordered w-full mb-2"
            value={otrosDatos.adelanto}
            onChange={(e) =>
              handleOtrosDatosChange("adelanto", Number(e.target.value))
            }
          />

          <label className="block mb-2 text-base-content">Método de Pago</label>
          <select
            className="select select-bordered w-full mb-2"
            value={otrosDatos.metodo_pago || ""}
            onChange={(e) =>
              handleOtrosDatosChange("metodo_pago", e.target.value)
            }
          >
            <option value="" disabled>
              Seleccione un método de pago
            </option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="debito">Débito</option>
            <option value="credito">Crédito</option>
          </select>

          <label className="block mb-2 text-base-content">Procedencia</label>
          <select
            className="select select-bordered w-full mb-2"
            value={otrosDatos.procedencia || ""}
            onChange={(e) =>
              handleOtrosDatosChange("procedencia", e.target.value)
            }
          >
            <option value="" disabled>
              Seleccione la procedencia
            </option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="recomendado">Recomendado</option>
            <option value="local">Local</option>
            <option value="anuncio">Anuncio</option>
          </select>

          <label className="block mb-2 text-base-content">Retiro</label>
          <select
            className="select select-bordered w-full mb-2"
            value={otrosDatos.estado || ""}
            onChange={(e) => handleOtrosDatosChange("estado", e.target.value)}
          >
            <option value="" disabled>
              Seleccione la condición de retiro
            </option>
            <option value="retira">Retira</option>
            <option value="enviar">Enviar</option>
            <option value="instalacion">Instalación</option>
          </select>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
        <button
          type="button"
          className="btn btn-secondary w-full sm:w-auto"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary w-full sm:w-auto"
          onClick={handleSubmit}
        >
          Guardar
        </button>
      </div>

      {/* Error Modal */}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
    </>
  );
};

export default NuevoPedido;
