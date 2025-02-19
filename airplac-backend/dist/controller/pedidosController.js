"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePedido = exports.cambiarEstadoAEntregado = exports.getRemito = exports.uploadRemito = exports.createPedido = exports.getPedidos = void 0;
const pedidosModel_1 = __importDefault(require("../models/pedidosModel"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getPedidos = async (req, res) => {
    try {
        const pedidos = await pedidosModel_1.default.aggregate([
            { $unwind: "$productos" },
            {
                $lookup: {
                    from: "Modelos",
                    localField: "productos.idModelo",
                    foreignField: "_id",
                    as: "modeloInfo",
                },
            },
            {
                $lookup: {
                    from: "Stock",
                    localField: "productos.idStock",
                    foreignField: "_id",
                    as: "stockInfo",
                },
            },
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
                    remitos: { $first: "$remitos" }, // ✅ Traer los remitos
                    productos: {
                        $push: {
                            cantidad: "$productos.cantidad",
                            unidad: "$productos.unidad",
                            materiales: "$productos.materiales",
                            modelo: { $arrayElemAt: ["$modeloInfo.modelo", 0] },
                            producto: { $arrayElemAt: ["$stockInfo.producto", 0] },
                        },
                    },
                },
            },
        ]);
        const pedidosFormateados = pedidos.map((pedido) => ({
            id: pedido._id,
            remito: pedido.remito,
            fecha: pedido.fecha_pedido?.toISOString().split("T")[0] || "",
            año: new Date(pedido.fecha_pedido).getFullYear().toString(),
            cliente: pedido.cliente?.nombre || "",
            direccion: pedido.cliente?.direccion || "",
            contacto: pedido.cliente?.contacto || "",
            detalle: pedido.productos
                .map((prod) => prod.modelo || "Sin modelo")
                .join(", "),
            cantidadM2: pedido.productos.reduce((sum, prod) => sum + prod.cantidad, 0),
            materiales: pedido.productos
                .map((prod) => prod.materiales || "Sin materiales")
                .join(", "),
            valorM2: `$${(pedido.total /
                pedido.productos.reduce((sum, prod) => sum + prod.cantidad, 0)).toFixed(2)}`,
            pago: pedido.metodo_pago,
            procedencia: pedido.procedencia,
            flete: pedido.flete ? `$${pedido.flete.toFixed(2)}` : "",
            seña: pedido.adelanto ? `$${pedido.adelanto.toFixed(2)}` : "",
            descuento: pedido.descuento ? `${pedido.descuento.toFixed(2)}%` : "",
            total: `$${pedido.total.toFixed(2)}`,
            estado: pedido.estado,
            disponible: pedido.estado === "disponible" ? "Sí" : "No",
            // ✅ Aquí agregamos los remitos con URL completa
            remitos: pedido.remitos?.map((remito) => ({
                url: `${req.protocol}://${req.get("host")}${remito.url}`,
                fecha: remito.fecha,
            })) || [],
        }));
        res.status(200).json(pedidosFormateados);
    }
    catch (error) {
        console.error("Error al obtener los pedidos:", error);
        res.status(500).json({ message: "Error al obtener los pedidos", error });
    }
};
exports.getPedidos = getPedidos;
const createPedido = async (req, res) => {
    try {
        console.log(req.body);
        const { remito, vendedor_id, cliente, productos, estado, fecha_pedido, fecha_entrega_estimada, demora_calculada, metodo_pago, procedencia, flete, descuento, adelanto, total, } = req.body;
        // Crear el pedido
        const nuevoPedido = new pedidosModel_1.default({
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
    }
    catch (error) {
        console.error("Error al crear el pedido:", error);
        console.log(req.params);
        res.status(500).json({ message: "Error al crear el pedido", error });
    }
};
exports.createPedido = createPedido;
const uploadRemito = async (req, res) => {
    try {
        const pedido = await pedidosModel_1.default.findById(req.params.id);
        if (!pedido) {
            res.status(404).json({ message: "Pedido no encontrado" });
            return;
        }
        pedido.remitos.push({ url: `/uploads/remitos/${req.file?.filename}` });
        // ✅ Cambiar el estado a "remitado"
        pedido.estado = "remitado";
        await pedido.save();
        console.log("Remito subido y estado actualizado a 'remitado'", req.file?.filename);
        res
            .status(200)
            .json({ message: "Remito subido con éxito", remito: req.file?.filename });
    }
    catch (error) {
        console.log("Error al subir el remito", error);
        res.status(500).json({ message: "Error al subir el remito", error });
    }
};
exports.uploadRemito = uploadRemito;
const getRemito = (req, res) => {
    const filePath = path_1.default.resolve(__dirname, "../../uploads/remitos", req.params.filename);
    if (fs_1.default.existsSync(filePath)) {
        res.sendFile(filePath);
    }
    else {
        console.error(`Archivo no encontrado: ${filePath}`);
        res.status(404).json({ message: "Archivo no encontrado" });
    }
};
exports.getRemito = getRemito;
const cambiarEstadoAEntregado = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await pedidosModel_1.default.findById(id);
        if (!pedido) {
            res.status(404).json({ message: "Pedido no encontrado" });
            return;
        }
        const estadosPermitidos = ["retira", "enviar", "instalacion"];
        if (!estadosPermitidos.includes(pedido.estado)) {
            res.status(400).json({
                message: "El pedido no está en un estado que permita el cambio a 'entregado'",
            });
            return;
        }
        // ✅ Cambiar el estado a "entregado"
        pedido.estado = "entregado";
        await pedido.save();
        res.status(200).json({ message: "Estado cambiado a 'entregado'", pedido });
    }
    catch (error) {
        console.error("Error al cambiar el estado:", error);
        res.status(500).json({ message: "Error al cambiar el estado", error });
    }
};
exports.cambiarEstadoAEntregado = cambiarEstadoAEntregado;
const updatePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const pedidoActualizado = await pedidosModel_1.default.findByIdAndUpdate(id, updates, {
            new: true, // Devuelve el pedido actualizado
            runValidators: true, // Valida los datos antes de actualizar
        });
        if (!pedidoActualizado) {
            res.status(404).json({ message: "Pedido no encontrado" });
            return;
        }
        res.status(200).json({
            message: "Pedido actualizado con éxito",
            pedido: pedidoActualizado,
        });
    }
    catch (error) {
        console.error("Error al actualizar el pedido:", error);
        res.status(500).json({ message: "Error al actualizar el pedido", error });
    }
};
exports.updatePedido = updatePedido;
