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
  editarPedido: boolean;
  pedido?: any;
}

interface Producto {
  idStock: string;
  idModelo: string;
  cantidad: number;
  unidad: string;
  materiales: string;
  materiales_sueltos?: number;
  valor: number;
  promo1: number;
  promo2: number;
  promo3: number;
  precio: number;
  precio_promo1: number;
  precio_promo2: number;
  precio_promo3: number;
  porcentaje_ganancia: number;
  porcentaje_tarjeta: number;
  total_redondeo: number;
  pago: string;
}

const NuevoPedido: React.FC<NuevoPedidoProps> = ({
  onClose,
  onPedidoCreado,
  remito,
  editarPedido,
  pedido,
}) => {
  const { fetchPedidos } = useAppContext();

  const [stockData, setStockData] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const [productos, setProductos] = useState<Producto[]>([
    {
      idStock: "",
      idModelo: "",
      cantidad: 0,
      unidad: "",
      materiales: "",
      valor: 0,
      promo1: 0,
      promo2: 0,
      promo3: 0,
      precio: 0,
      precio_promo1: 0,
      precio_promo2: 0,
      precio_promo3: 0,
      porcentaje_ganancia: 0,
      porcentaje_tarjeta: 0,
      total_redondeo: 0,
      pago: "",
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
    valor_instalacion: 0,
  });

  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [incluyeInstalacion, setIncluyeInstalacion] = useState(false);
  // Estado para el checkbox de "Pago el total"
  const [pagoTotal, setPagoTotal] = useState(false);
  const [productosModificados, setProductosModificados] = useState<{
    agregados: Producto[];
    modificados_cantidad: {
      index: number;
      producto: Producto;
      original: Producto;
    }[];
    modificados_tipo: {
      index: number;
      producto: Producto;
      original: Producto;
    }[];
    eliminados: { index: number; producto: Producto }[];
  }>({
    agregados: [],
    modificados_cantidad: [],
    modificados_tipo: [],
    eliminados: [],
  });

  // Cargar datos de stock
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/stock/`);
        console.log(response.data);
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
    const resetForm = () => {
      setProductos([
        {
          idStock: "",
          idModelo: "",
          cantidad: 0,
          unidad: "",
          materiales: "",
          valor: 0,
          promo1: 0,
          promo2: 0,
          promo3: 0,
          precio: 0,
          precio_promo1: 0,
          precio_promo2: 0,
          precio_promo3: 0,
          porcentaje_ganancia: 0,
          porcentaje_tarjeta: 0,
          total_redondeo: 0,
          pago: "",
        },
      ]);
      setCliente({
        nombre: "",
        direccion: "",
        contacto: "",
      });
      setOtrosDatos({
        estado: "",
        fecha_pedido: "",
        fecha_entrega_estimada: "",
        metodo_pago: "",
        procedencia: "",
        flete: 0,
        descuento: 0,
        adelanto: 0,
        total: 0,
        valor_instalacion: 0,
      });
    };
    resetForm();
  }, [remito]);

  useEffect(() => {
    if (editarPedido && pedido) {
      console.log("Pedido a editar:", pedido);

      // ✅ Cargar datos del pedido en edición

      setProductos(
        pedido.productos.map((p: any) => ({
          idStock: p.idStock || "",
          idModelo: p.idModelo || "",
          cantidad: p.cantidad || 0,
          unidad: p.unidad || "",
          materiales: p.materiales || "",
          materiales_sueltos: p.materiales_sueltos || "",
          valor: p.valor || 0,
          promo1: p.promo1 || 0,
          promo2: p.promo2 || 0,
          promo3: p.promo3 || 0,
          precio: p.precio || 0,
          precio_promo1: p.precio_promo1 || 0,
          precio_promo2: p.precio_promo2 || 0,
          precio_promo3: p.precio_promo3 || 0,
          porcentaje_ganancia: p.porcentaje_ganancia || 0,
          porcentaje_tarjeta: p.porcentaje_tarjeta || 0,
          total_redondeo: p.total_redondeo || 0,
          estado_stock: p.estado_stock || "pendiente",
        }))
      );

      setCliente({
        nombre: pedido.cliente || "",
        direccion: pedido.direccion || "",
        contacto: pedido.contacto || "",
      });

      setOtrosDatos({
        estado: pedido.estado || "",
        fecha_pedido: pedido.fecha || "",
        fecha_entrega_estimada: "",
        metodo_pago: pedido.pago || "",
        procedencia: pedido.procedencia || "",
        flete: pedido.flete || 0,
        descuento: Number(pedido.descuento) || 0,
        adelanto: Number(pedido.seña) || 0,
        total: Number(pedido.total) || 0,
        valor_instalacion: Number(pedido.valor_instalacion) || 0,
      });
      setIncluyeInstalacion((pedido.valor_instalacion || 0) > 0);
    } else {
      setProductos([
        {
          idStock: "",
          idModelo: "",
          cantidad: 0,
          unidad: "",
          materiales: "",
          valor: 0,
          promo1: 0,
          promo2: 0,
          promo3: 0,
          precio: 0,
          precio_promo1: 0,
          precio_promo2: 0,
          precio_promo3: 0,
          porcentaje_ganancia: 0,
          porcentaje_tarjeta: 0,
          total_redondeo: 0,
          pago: "",
        },
      ]);

      setCliente({
        nombre: "",
        direccion: "",
        contacto: "",
      });

      setOtrosDatos({
        estado: "",
        fecha_pedido: "",
        fecha_entrega_estimada: "",
        metodo_pago: "",
        procedencia: "",
        flete: 0,
        descuento: 0,
        adelanto: 0,
        total: 0,
        valor_instalacion: 0,
      });

      setCurrentTotal(0); // ✅ También reiniciar el total
      setIncluyeInstalacion(false);
    }
  }, [editarPedido, pedido]);

  // ✅ Nuevo useEffect para cargar datos del stock cuando se está en modo edición
  useEffect(() => {
    if (editarPedido && pedido && stockData.length > 0) {
      const productosActualizados = productos.map((producto) => {
        if (producto.idStock) {
          const stockSeleccionado = stockData.find(
            (item) => item._id === producto.idStock
          );
          if (stockSeleccionado) {
            return {
              ...producto,
              idModelo: stockSeleccionado.idModelo,
              unidad: stockSeleccionado.unidad,
              valor: stockSeleccionado.valor || 0,
              promo1: stockSeleccionado.promo1 || 0,
              promo2: stockSeleccionado.promo2 || 0,
              promo3: stockSeleccionado.promo3 || 0,
              precio: stockSeleccionado.precio || 0,
              precio_promo1: stockSeleccionado.precio_promo1 || 0,
              precio_promo2: stockSeleccionado.precio_promo2 || 0,
              precio_promo3: stockSeleccionado.precio_promo3 || 0,
              porcentaje_ganancia: stockSeleccionado.porcentaje_ganancia || 0,
              porcentaje_tarjeta: stockSeleccionado.porcentaje_tarjeta || 0,
              total_redondeo: stockSeleccionado.total_redondeo || 0,
              pago: stockSeleccionado.pago || "",
            };
          }
        }
        return producto;
      });

      if (JSON.stringify(productosActualizados) !== JSON.stringify(productos)) {
        setProductos(productosActualizados);
      }
    }
  }, [editarPedido, pedido, stockData, productos]);

  useEffect(() => {
    const totalFormateado: any = new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(calcularTotal());

    setCurrentTotal(totalFormateado);
  }, [productos, otrosDatos]);
  // Si se marca el checkbox, se actualiza adelanto con el total actual.
  useEffect(() => {
    if (pagoTotal) {
      handleOtrosDatosChange("adelanto", calcularTotal());
    } else {
      handleOtrosDatosChange("adelanto", 0);
    }
    // Se actualiza cuando cambian los productos o datos que afectan el total
  }, [
    productos,
    otrosDatos.flete,
    otrosDatos.descuento,
    otrosDatos.valor_instalacion,
    pagoTotal,
  ]);

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
        valor: 0,
        promo1: 0,
        promo2: 0,
        promo3: 0,
        precio: 0,
        precio_promo1: 0,
        precio_promo2: 0,
        precio_promo3: 0,
        porcentaje_ganancia: 0,
        porcentaje_tarjeta: 0,
        total_redondeo: 0,
        pago: "",
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
    if (
      field === "cantidad" &&
      (value as number) < 10 &&
      (value as number) > 0
    ) {
      nuevosProductos[index].materiales = "promo1";
    }
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
      console.log(productoSeleccionado);
      const nuevosProductos = [...productos];
      nuevosProductos[index] = {
        ...nuevosProductos[index],
        idStock: productoSeleccionado._id,
        idModelo: productoSeleccionado.idModelo,
        unidad: productoSeleccionado.unidad,
        // Ponemos los valores de precio disponibles
        valor: productoSeleccionado.valor || 0,
        promo1: productoSeleccionado.promo1 || 0,
        promo2: productoSeleccionado.promo2 || 0,
        promo3: productoSeleccionado.promo3 || 0,
        precio: productoSeleccionado.precio || 0,
        precio_promo1: productoSeleccionado.precio_promo1 || 0,
        precio_promo2: productoSeleccionado.precio_promo2 || 0,
        precio_promo3: productoSeleccionado.precio_promo3 || 0,
        porcentaje_ganancia: productoSeleccionado.porcentaje_ganancia || 0,
        porcentaje_tarjeta: productoSeleccionado.porcentaje_tarjeta || 0,
        total_redondeo: productoSeleccionado.total_redondeo || 0,
        pago: productoSeleccionado.pago || "",
        // Por defecto materiales = "" (o lo que corresponda)
        materiales: "",
      };
      setProductos(nuevosProductos);
    }
  };
  const calcularTotal = () => {
    const subtotalProductos = productos.reduce((sum, prod) => {
      console.log(prod);
      let valorBase = prod.precio;
      if (prod.materiales === "promo1") {
        valorBase = prod.precio_promo1 || 0;
      } else if (prod.materiales === "promo2") {
        valorBase = prod.precio_promo3 || 0;
      } else if (prod.materiales === "promo3") {
        valorBase = prod.precio_promo3 || 0;
      }

      if (otrosDatos.metodo_pago === "credito") {
        valorBase += valorBase * (prod.porcentaje_tarjeta / 100);
      }

      return sum + prod.cantidad * valorBase;
    }, 0);

    // Subtotal incluyendo flete
    const subtotalConFlete = subtotalProductos + (otrosDatos.flete || 0);

    // Aplicar descuento (si otrosDatos.descuento = 10, significa 10% de descuento)
    const descuentoDecimal = (otrosDatos.descuento || 0) / 100;
    const totalConDescuento = subtotalConFlete;

    // Restar adelanto
    let totalFinal = totalConDescuento;

    // ✅ Sumar materiales_sueltos si existen
    const totalMaterialesSueltos = productos.reduce((sum, prod) => {
      return sum + (prod.materiales_sueltos ? prod.materiales_sueltos : 0);
    }, 0);

    totalFinal += totalMaterialesSueltos + (otrosDatos.valor_instalacion || 0);

    return parseFloat((totalFinal > 0 ? totalFinal : 0).toFixed(2));
  };

  // Validación
  const validateForm = () => {
    if (!cliente.nombre.trim()) {
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

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const totalEnviado = calcularTotal();

    try {
      let response;
      let data: any = {
        vendedor_id: "6790061fce76c812a9cb0ce2",
        cliente,
        productos,
        estado: otrosDatos.estado,
        fecha_entrega_estimada: new Date().toISOString(),
        demora_calculada: 6,
        metodo_pago: otrosDatos.metodo_pago,
        procedencia: otrosDatos.procedencia,
        flete: Number(otrosDatos.flete) || 0,
        descuento: Number(otrosDatos.descuento) || 0,
        adelanto: Number(otrosDatos.adelanto) || 0,
        total: totalEnviado,
        valor_instalacion: Number(otrosDatos.valor_instalacion) || 0,
        total_pendiente: Math.max(
          totalEnviado - Number(otrosDatos.adelanto || 0),
          0
        ),
      };

      if (editarPedido && pedido) {
        // Editando: NO se incluye remito ni fecha_pedido

        console.log(data);
        response = await axios.put(
          `${API_BASE_URL}/pedidos/editar/${pedido.id}`,
          data
        );
        console.log("Pedido actualizado con éxito:", response.data);
      } else {
        // Nuevo pedido: SE incluye remito y fecha_pedido
        data = {
          ...data,
          remito,
          fecha_pedido: new Date().toISOString(),
        };

        response = await axios.post(`${API_BASE_URL}/pedidos/`, data);
        console.log("Pedido creado con éxito:", response.data);
      }

      fetchPedidos();
      onPedidoCreado();
      onClose();
    } catch (error) {
      console.error("Error al crear o actualizar el pedido:", error);
      setErrorMessage("Hubo un error al procesar el pedido");
    } finally {
      setIsLoading(false);
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
              {/* Checkbox de instalación */}
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">¿Incluye instalación?</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={incluyeInstalacion}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setIncluyeInstalacion(isChecked);
                      if (!isChecked) {
                        handleOtrosDatosChange("valor_instalacion", 0);
                      }
                    }}
                  />
                </label>
              </div>
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
                {stockData
                  .filter((producto) => {
                    // Permitir el producto actualmente seleccionado en este tab
                    if (productos[activeTab]?.idStock === producto._id) {
                      return true;
                    }
                    // Filtrar productos que ya están seleccionados en otros tabs
                    const productosSeleccionados = productos
                      .map((p, index) => ({ idStock: p.idStock, index }))
                      .filter((p) => p.idStock && p.index !== activeTab);

                    return !productosSeleccionados.some(
                      (p) => p.idStock === producto._id
                    );
                  })
                  .map((producto) => (
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
                value={productos[activeTab]?.cantidad || ""}
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
                disabled
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
                disabled={
                  productos[activeTab]?.cantidad > 0 &&
                  productos[activeTab]?.cantidad < 10
                }
              >
                <option value="" disabled>
                  Seleccione una opción
                </option>
                <option value="sinpromo">sin promo</option>
                <option value="promo1">promo1</option>
                <option value="promo2">promo2</option>
                <option value="promo3">promo3</option>
              </select>

              {productos[activeTab]?.cantidad > 0 &&
                productos[activeTab]?.cantidad < 10 && (
                  <>
                    <label className="block mt-4 mb-2 text-base-content">
                      Materiales Sueltos
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      placeholder="Materiales sueltos"
                      value={productos[activeTab]?.materiales_sueltos || ""}
                      onChange={(e) =>
                        handleProductoChange(
                          activeTab,
                          "materiales_sueltos",
                          Number(e.target.value)
                        )
                      }
                    />
                  </>
                )}
              {incluyeInstalacion && (
                <div className="mt-4">
                  <label className="block mb-2 text-base-content">
                    Total por instalación
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="Ej: 10000"
                    value={otrosDatos.valor_instalacion || ""}
                    onChange={(e) =>
                      handleOtrosDatosChange(
                        "valor_instalacion",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              )}
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
          {/* Checkbox "Pago el total" */}
          <div className="form-control mb-2">
            <label className="label cursor-pointer">
              <span className="label-text">Pago el total</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={pagoTotal}
                onChange={(e) => {
                  setPagoTotal(e.target.checked);
                  if (e.target.checked) {
                    handleOtrosDatosChange("adelanto", calcularTotal());
                  }
                }}
              />
            </label>
          </div>

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
        {isLoading ? (
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto cursor-not-allowed"
          >
            <span className="loading loading-spinner"></span> Guardando...
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            onClick={handleSubmit}
          >
            Guardar
          </button>
        )}
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
