import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import axios from "axios";
import { API_BASE_URL } from "../../config";

interface Stock {
  _id: string;
  modelo: string;
  idVendedor: string;
  idModelo: string;
}

interface Pedido {
  remito: string;
  vendedor_id: string;
  cliente: {
    nombre: string;
    direccion: string;
    contacto: string;
  };
  productos: {
    idStock: string;
    idModelo: string;
    modelo: string;
    cantidad: number;
    unidad: string;
  }[];
  estado: string;
  fecha_pedido: string;
  fecha_entrega_estimada: string;
  demora_calculada: number;
  metodo_pago: string;
  procedencia: string;
  flete: number;
  descuento: number;
  adelanto: number;
  total: number;
}

const ImportarPedido: React.FC = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const idVendedor = "6790061fce76c812a9cb0ce2"; // Id del vendedor (puedes parametrizar esto según el contexto)

  // Cargar los datos del stock desde la API
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get<Stock[]>(
          `${API_BASE_URL}/stock/importacion/${idVendedor}`
        );
        console.log(response);
        setStock(response.data);
      } catch (err) {
        console.error("Error al obtener el stock:", err);
        setError("No se pudo cargar el stock. Intente nuevamente.");
      }
    };

    fetchStock();
  }, [idVendedor]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors } = results;

        if (errors.length > 0) {
          setError("Error al procesar el archivo CSV.");
          console.error(errors);
          return;
        }

        const pedidosImportados: any[] = data.map((row: any) => {
          const detalle = row.Detalle?.trim(); // Eliminar espacios en blanco
          const modeloEncontrado = stock.find(
            (item) => item.modelo.trim() === detalle
          );
          console.log(modeloEncontrado);

          if (!detalle) {
            console.warn(`El campo 'Detalle' está vacío en la fila:`, row);
          } else if (!modeloEncontrado) {
            console.warn(`Modelo no encontrado para el detalle: ${detalle}`);
          }

          return {
            remito: row.Remito || "",
            vendedor_id: idVendedor,
            cliente: {
              nombre: row.Cliente || "",
              direccion: row.Direccion || "",
              contacto: row.Contacto || "",
            },
            productos: [
              {
                idStock: modeloEncontrado?._id || "",
                idModelo: modeloEncontrado?.idModelo || "",
                modelo: detalle || "",
                cantidad: parseFloat(row.Cantidad) || 0,
                unidad: "M2",
                materiales: row.Materiales,
              },
            ],
            estado: row.Estado || "pendiente",
            fecha_pedido: row["Fecha Pedido"] || new Date().toISOString(),
            fecha_entrega_estimada:
              row["Fecha Entrega Estimada"] || new Date().toISOString(),
            demora_calculada: parseInt(row["Demora Calculada"], 10) || 0,
            metodo_pago: row["Método Pago"] || "efectivo",
            procedencia: row.Procedencia || "local",
            flete: parseFloat(row.Flete) || 0,
            descuento: parseFloat(row.Descuento) || 0,
            adelanto: parseFloat(row.Adelanto) || 0,
            total: parseFloat(row.Total) || 0,
          };
        });

        setPedidos(pedidosImportados);
        setError(null);
      },
      error: (err) => {
        setError("Error al leer el archivo CSV.");
        console.error(err);
      },
    });
  };

  const handleSubmit = async () => {
    const exitosos: Pedido[] = [];
    const fallidos: { pedido: Pedido; error: string }[] = [];

    try {
      const results = await Promise.allSettled(
        pedidos.map((pedido) => axios.post(`${API_BASE_URL}/pedidos/`, pedido))
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          // Pedido insertado correctamente
          exitosos.push(pedidos[index]);
        } else {
          // Pedido fallido con el mensaje de error
          fallidos.push({
            pedido: pedidos[index],
            error: result.reason.response?.data?.message || "Error desconocido",
          });
        }
      });

      // Mostrar el estado de la operación
      setSuccess(`Se importaron ${exitosos.length} pedidos correctamente.`);
      setError(
        fallidos.length > 0
          ? `No se pudieron importar ${fallidos.length} pedidos.`
          : null
      );
      setPedidos(fallidos.map((f) => f.pedido)); // Mantener solo los pedidos fallidos en la lista para corrección
    } catch (error) {
      console.error("Error general al procesar los pedidos:", error);
      setError("Error al enviar los pedidos a la API. Intente nuevamente.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Importar Pedidos</h2>

      {/* Input para cargar el archivo */}
      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="file-input file-input-bordered w-full max-w-xs"
        />
      </div>

      {/* Mostrar errores */}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* Tabla para mostrar los pedidos importados */}
      {pedidos.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Remito</th>
                  <th>Cliente</th>
                  <th>Modelo</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, index) => (
                  <tr key={index}>
                    <td>{pedido.remito}</td>
                    <td>{pedido.cliente.nombre}</td>
                    <td>
                      {pedido.productos.map((prod) => prod.modelo).join(", ")}
                    </td>
                    <td>
                      {pedido.productos.reduce(
                        (total, prod) => total + prod.cantidad,
                        0
                      )}
                    </td>
                    <td>{pedido.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleSubmit} className="btn btn-primary mt-4">
            Enviar Pedidos
          </button>
        </>
      )}
    </div>
  );
};

export default ImportarPedido;
