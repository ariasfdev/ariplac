import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { useAppContext } from "../context/AppContext";

interface NuevoPedidoProps {
  onClose: () => void;
  onPedidoCreado: () => void; // Añade esta prop en la interfaz
}

const NuevoPedido: React.FC<NuevoPedidoProps> = ({ onClose }) => {
  const { fetchPedidos } = useAppContext();
  const [stockData, setStockData] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<number>(0); // Sección activa
  const [productos, setProductos] = useState([
    {
      idStock: "",
      idModelo: "",
      cantidad: 0,
      unidad: "",
      materiales: "",
      valor_m2: 0,
    },
  ]);
  const [activeTab, setActiveTab] = useState<number>(0); // Producto activo
  const [cliente, setCliente] = useState({
    nombre: "",
    direccion: "",
    contacto: "",
  });
  const [otrosDatos, setOtrosDatos] = useState({
    estado: "pendiente",
    fecha_pedido: "",
    fecha_entrega_estimada: "",
    metodo_pago: "",
    procedencia: "",
    flete: 0,
    descuento: 0,
    adelanto: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/stock/");
        setStockData(response.data.filter((item: any) => item.stockActivo)); // Filtrar productos activos
      } catch (err) {
        console.error("Error al obtener datos del stock:", err);
      }
    };

    fetchStockData();
  }, []);

  const agregarProducto = () => {
    setProductos([
      ...productos,
      {
        idStock: "",
        idModelo: "",
        cantidad: 0,
        unidad: "",
        materiales: "",
        valor_m2: 0,
      },
    ]);
    setActiveTab(productos.length); // Activa automáticamente el nuevo producto
  };

  const eliminarProducto = (index: number) => {
    const nuevosProductos = productos.filter((_, i) => i !== index);
    setProductos(nuevosProductos);

    // Ajustar el producto activo después de eliminar
    if (index === activeTab && nuevosProductos.length > 0) {
      setActiveTab(index === 0 ? 0 : index - 1);
    } else if (nuevosProductos.length === 0) {
      setActiveTab(0);
    }
  };

  const handleProductoChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const nuevosProductos = [...productos];
    console.log(index, field, value);
    nuevosProductos[index] = { ...nuevosProductos[index], [field]: value };
    setProductos(nuevosProductos);
  };

  const handleClienteChange = (field: string, value: string) => {
    setCliente((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtrosDatosChange = (field: string, value: string | number) => {
    console.log(`Cambiando ${field} a`, value); // Debug para verificar el cambio
    setOtrosDatos((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const data = {
      remito: "1030",
      vendedor_id: "6790061fce76c812a9cb0ce2",
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
      total: productos.reduce(
        (sum, prod) => sum + prod.cantidad * (prod.valor_m2 || 0),
        0
      ),
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/pedidos/",
        data
      );
      console.log("Pedido creado con éxito:", response.data);

      // Llamar a la función pasada como prop
      fetchPedidos();

      // Cierra el modal
      onClose();
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      alert("Hubo un error al crear el pedido");
    }
  };
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
        materiales: "",
        valor_m2: productoSeleccionado.valor_m2, // Materiales vacíos por defecto
      };
      setProductos(nuevosProductos);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-base-content">Nuevo Pedido</h2>

      {/* Tabs de secciones */}
      <div className="flex gap-4 mb-4">
        <button
          className={`btn ${
            activeSection === 0 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(0)}
        >
          Productos
        </button>
        <button
          className={`btn ${
            activeSection === 1 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(1)}
        >
          Cliente
        </button>
        <button
          className={`btn ${
            activeSection === 2 ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setActiveSection(2)}
        >
          Otros Datos
        </button>
      </div>

      {/* Sección de productos */}
      {activeSection === 0 && (
        <>
          {/* Iconos de los productos */}
          <div className="flex items-center gap-4 mb-4">
            {productos.map((_, index) => (
              <div
                key={index}
                className={`relative flex flex-col items-center cursor-pointer ${
                  activeTab === index
                    ? "text-primary scale-110"
                    : "text-base-content opacity-50"
                } transition-all duration-300`}
                onClick={() => setActiveTab(index)}
                title={`Producto ${index + 1}`}
              >
                {/* Ícono de carrito */}
                <FaShoppingCart size={activeTab === index ? 32 : 24} />
                {/* Título del producto activo */}
                {activeTab === index && (
                  <span className="text-xs font-bold mt-1">
                    Producto {index + 1}
                  </span>
                )}
                {/* Botón de eliminar */}
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
              className="btn btn-secondary text-xs"
              onClick={agregarProducto}
            >
              + Agregar
            </button>
          </div>

          {/* Contenedor del producto activo */}
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
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Materiales"
                value={productos[activeTab]?.materiales || ""}
                onChange={(e) =>
                  handleProductoChange(activeTab, "materiales", e.target.value)
                }
              />
            </div>
          ) : (
            <p className="text-center text-base-content opacity-50">
              No hay productos disponibles.
            </p>
          )}
        </>
      )}

      {/* Sección de cliente */}
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

      {/* Sección de otros datos */}
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
          <label className="block mb-2 text-base-content">Descuento</label>
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
            value={otrosDatos.metodo_pago || ""} // Asegúrate de que no sea undefined
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
            value={otrosDatos.procedencia || ""} // Asegúrate de que no sea undefined
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
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end mt-4">
        <button
          type="button"
          className="btn btn-secondary mr-2"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          Guardar
        </button>
      </div>
    </>
  );
};

export default NuevoPedido;
// function onPedidoCreado() {
//   throw new Error("Function not implemented.");
// }
