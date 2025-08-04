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
    materiales: string;
    materiales_sueltos: number;
    estado_stock: string;
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
  remitos: any[];
}

const ImportarPedido: React.FC = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const idVendedor = "6790061fce76c812a9cb0ce2";

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get<Stock[]>(
          `${API_BASE_URL}/stock/importacion/${idVendedor}`
        );
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

        const pedidosMap = new Map<string, Pedido>();

        (data as any[]).forEach((row) => {
          const remito = row.Remito;
          const detalle = row.Detalle?.trim();
          const modeloEncontrado = stock.find(
            (item) => item.modelo.trim() === detalle
          );

          const producto = {
            idStock: modeloEncontrado?._id || "",
            idModelo: modeloEncontrado?.idModelo || "",
            modelo: detalle || "",
            cantidad: parseFloat(row.Cantidad.replace(",", ".")) || 0,
            unidad: "M2",
            materiales: row.Materiales || "",
            materiales_sueltos: 0,
            estado_stock:
              row.Estado?.toLowerCase() === "entregado"
                ? "entregado"
                : "pendiente",
          };

          if (pedidosMap.has(remito)) {
            pedidosMap.get(remito)?.productos.push(producto);
          } else {
            pedidosMap.set(remito, {
              remito: remito,
              vendedor_id: idVendedor,
              cliente: {
                nombre: row.Cliente || "",
                direccion: row.Direccion || "",
                contacto: row.Contacto || "",
              },
              productos: [producto],
              estado: row.Estado || "pendiente",
              fecha_pedido: new Date(
                Number(row.Fecha) * 86400000
              ).toISOString(),
              fecha_entrega_estimada: new Date().toISOString(),
              demora_calculada: 0,
              metodo_pago: row.Pago || "efectivo",
              procedencia: row.Procedencia || "local",
              flete: parseFloat(row.Flete) || 0,
              descuento: parseFloat(row.Descuento) || 0,
              adelanto: parseFloat(row.Seña || row.Adelanto) || 0,
              total: parseFloat(row.Total) || 0,
              remitos: [],
            });
          }
        });

        setPedidos(Array.from(pedidosMap.values()));
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
          exitosos.push(pedidos[index]);
        } else {
          fallidos.push({
            pedido: pedidos[index],
            error: result.reason.response?.data?.message || "Error desconocido",
          });
        }
      });

      setSuccess(`Se importaron ${exitosos.length} pedidos correctamente.`);
      setError(
        fallidos.length > 0
          ? `No se pudieron importar ${fallidos.length} pedidos.`
          : null
      );
      setPedidos(fallidos.map((f) => f.pedido));
    } catch (error) {
      console.error("Error general al procesar los pedidos:", error);
      setError("Error al enviar los pedidos a la API. Intente nuevamente.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Importar Pedidos</h2>

      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="file-input file-input-bordered w-full max-w-xs"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {pedidos.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Remito</th>
                  <th>Cliente</th>
                  <th>Modelo(s)</th>
                  <th>Cantidad Total</th>
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
