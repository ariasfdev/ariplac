import { Request, Response } from "express";
import Pedido from "../models/pedidosModel";
import Stock from "../models/stockModel"; // Modelo para el stock
import Modelo from "../models/modelosModel"; // Modelo para los modelos



export const getPedidos = async (req: Request, res: Response): Promise<void> => {
  try {
    // Usamos aggregate para realizar el join de idModelo y idStock
    const pedidos = await Pedido.aggregate([
      // Descomponer los productos
      { $unwind: "$productos" },
      // Lookup para idModelo
      {
        $lookup: {
          from: "Modelos", // Nombre de la colección de Modelos
          localField: "productos.idModelo", // Campo en Pedido
          foreignField: "_id", // Campo en Modelos
          as: "modeloInfo", // Resultado del join
        },
      },
      // Lookup para idStock
      {
        $lookup: {
          from: "Stock", // Nombre de la colección de Stock
          localField: "productos.idStock", // Campo en Pedido
          foreignField: "_id", // Campo en Stock
          as: "stockInfo", // Resultado del join
        },
      },
      // Agrupar nuevamente los productos con su información de modelo y stock
      {
        $group: {
          _id: "$_id",
          remito: { $first: "$remito" },
          fecha_pedido: { $first: "$fecha_pedido" },
          cliente: { $first: "$cliente" },
          estado: { $first: "$estado" },
          metodo_pago: { $first: "$metodo_pago" },
          procedencia: { $first: "$procedencia" },
          flete: { $first: "$flete" },
          descuento: { $first: "$descuento" },
          adelanto: { $first: "$adelanto" },
          total: { $first: "$total" },
          productos: {
            $push: {
              cantidad: "$productos.cantidad",
              unidad: "$productos.unidad",
              materiales: "$productos.materiales",
              modelo: { $arrayElemAt: ["$modeloInfo.modelo", 0] }, // Extraer modelo
              producto: { $arrayElemAt: ["$stockInfo.producto", 0] }, // Extraer producto
            },
          },
        },
      },
    ]);

    // Formatear los datos para la tabla
    const pedidosFormateados = pedidos.map((pedido) => ({
      remito: pedido.remito,
      fecha: pedido.fecha_pedido?.toISOString().split("T")[0] || "",
      año: new Date(pedido.fecha_pedido).getFullYear().toString(),
      cliente: pedido.cliente?.nombre || "",
      direccion: pedido.cliente?.direccion || "",
      contacto: pedido.cliente?.contacto || "",
      detalle: pedido.productos
        .map((prod: any) => prod.modelo || "Sin modelo")
        .join(", "),
      cantidadM2: pedido.productos.reduce(
        (sum: any, prod: any) => sum + prod.cantidad,
        0
      ),
      materiales: pedido.productos
        .map((prod: any) => prod.materiales || "Sin materiales")
        .join(", "),
      valorM2: `$${(
        pedido.total /
        pedido.productos.reduce((sum: any, prod: any) => sum + prod.cantidad, 0)
      ).toFixed(2)}`,
      pago: pedido.metodo_pago,
      procedencia: pedido.procedencia,
      flete: pedido.flete ? `$${pedido.flete.toFixed(2)}` : "",
      seña: pedido.adelanto ? `$${pedido.adelanto.toFixed(2)}` : "",
      descuento: pedido.descuento ? `${pedido.descuento.toFixed(2)}%` : "",
      total: `$${pedido.total.toFixed(2)}`,
      estado: pedido.estado,
      disponible: pedido.estado === "disponible" ? "Sí" : "No",
    }));
    

    res.status(200).json(pedidosFormateados);
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
    res.status(500).json({ message: "Error al obtener los pedidos", error });
  }
};



export const createPedido = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body)
    const {
      remito,
      vendedor_id,
      cliente,
      productos,
      estado,
      fecha_pedido,
      fecha_entrega_estimada,
      demora_calculada,
      metodo_pago,
      procedencia,
      flete,
      descuento,
      adelanto,
      total
    } = req.body;
    // Crear el pedido
    const nuevoPedido = new Pedido({
      remito,
      vendedor_id,
      cliente,
      productos,
      estado,
      fecha_pedido,
      fecha_entrega_estimada,
      demora_calculada,
      metodo_pago,
      procedencia,
      flete,
      descuento,
      adelanto,
      total, // Asignamos el total calculado
    });

    const pedidoGuardado = await nuevoPedido.save();
    res.status(201).json(pedidoGuardado);
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ message: "Error al crear el pedido", error });
  }
};
