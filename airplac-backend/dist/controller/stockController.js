"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarStock = exports.normalizarStock = exports.obtenerProduccionesPorStock = exports.registrarEntrega = exports.agregarProduccion = exports.deleteStock = exports.updateStock = exports.getStockById = exports.createStock = exports.getAllStocksImportacion = exports.getAllStocks = void 0;
const stockModel_1 = __importDefault(require("../models/stockModel"));
const produccionModel_1 = __importDefault(require("../models/produccionModel"));
const pedidosModel_1 = __importDefault(require("../models/pedidosModel"));
const getAllStocks = async (req, res) => {
    try {
        const stocks = await stockModel_1.default.find(); // Selecciona solo producto y modelo
        res.json(stocks);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener los stocks", error });
    }
};
exports.getAllStocks = getAllStocks;
const getAllStocksImportacion = async (req, res) => {
    try {
        // Obtener el idVendedor de los parámetros de la solicitud
        const { idVendedor } = req.params;
        // Validar que se proporcione un idVendedor
        if (!idVendedor) {
            res
                .status(400)
                .json({ message: "El parámetro idVendedor es obligatorio" });
            return;
        }
        // Validar el formato del idVendedor
        if (!idVendedor.match(/^[0-9a-fA-F]{24}$/)) {
            res
                .status(400)
                .json({ message: "El idVendedor proporcionado no es válido" });
            return;
        }
        // Obtener los stocks de la base de datos
        const stocks = await stockModel_1.default.find({}, { modelo: 1, _id: 1, idModelo: 1 }); // Selecciona solo modelo y _id
        // Agregar el campo idVendedor a cada registro
        const stocksConVendedor = stocks.map((stock) => ({
            ...stock.toObject(), // Convertir el documento a un objeto plano
            idVendedor, // Agregar el campo idVendedor
        }));
        // Enviar la respuesta
        res.json(stocksConVendedor);
    }
    catch (error) {
        console.error("Error al obtener los stocks:", error);
        res.status(500).json({ message: "Error al obtener los stocks", error });
    }
};
exports.getAllStocksImportacion = getAllStocksImportacion;
const createStock = async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body); // ✅ Verifica los datos que llegan al backend
        const newStock = new stockModel_1.default(req.body);
        await newStock.save();
        res
            .status(201)
            .json({ message: "Stock creado con éxito", stock: newStock });
    }
    catch (error) {
        console.error("Error al crear el stock:", error);
        res
            .status(400)
            .json({ message: "Error al crear el stock", error: error.message }); // ✅ Envía el mensaje exacto del error
    }
};
exports.createStock = createStock;
const getStockById = async (req, res) => {
    try {
        const stock = await stockModel_1.default.findById(req.params.id);
        if (!stock) {
            res.status(404).json({ message: "Stock no encontrado" });
            return;
        }
        res.json(stock);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el stock", error });
    }
};
exports.getStockById = getStockById;
const updateStock = async (req, res) => {
    try {
        const updatedStock = await stockModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStock) {
            res.status(404).json({ message: "Stock no encontrado" });
            return;
        }
        res.json({ message: "Stock actualizado con éxito", stock: updatedStock });
    }
    catch (error) {
        res.status(400).json({ message: "Error al actualizar el stock", error });
    }
};
exports.updateStock = updateStock;
const deleteStock = async (req, res) => {
    try {
        const deletedStock = await stockModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedStock) {
            res.status(404).json({ message: "Stock no encontrado" });
            return;
        }
        res.json({ message: "Stock eliminado con éxito" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar el stock", error });
    }
};
exports.deleteStock = deleteStock;
const agregarProduccion = async (req, res) => {
    const { idStock, cantidad, responsable } = req.body;
    try {
        // Agregar la producción
        const nuevaProduccion = await produccionModel_1.default.create({
            idStock,
            fecha: new Date(),
            cantidad,
            responsable,
        });
        // Actualizar cantidad_actual en la colección stock
        await stockModel_1.default.findByIdAndUpdate(idStock, { $inc: { cantidad_actual: cantidad } }, // Incrementar cantidad_actual
        { new: true });
        res.status(201).json({
            message: "Producción registrada correctamente",
            produccion: nuevaProduccion,
        });
    }
    catch (error) {
        console.error("Error al agregar producción:", error);
        res.status(500).json({ message: "Error al agregar producción", error });
    }
};
exports.agregarProduccion = agregarProduccion;
const registrarEntrega = async (req, res) => {
    const { idStock, cantidadEntregada } = req.body;
    try {
        // Actualizar cantidad_actual en la colección stock
        const stockActualizado = await stockModel_1.default.findByIdAndUpdate(idStock, { $inc: { cantidad_actual: -cantidadEntregada } }, // Decrementar cantidad_actual
        { new: true });
        res.status(200).json({
            message: "Entrega registrada correctamente",
            stock: stockActualizado,
        });
    }
    catch (error) {
        console.error("Error al registrar entrega:", error);
        res.status(500).json({ message: "Error al registrar entrega", error });
    }
};
exports.registrarEntrega = registrarEntrega;
const obtenerProduccionesPorStock = async (req, res) => {
    const { idStock } = req.params;
    try {
        const producciones = await produccionModel_1.default.find({ idStock });
        res.status(200).json(producciones);
    }
    catch (error) {
        console.error("Error al obtener producciones:", error);
        res.status(500).json({ message: "Error al obtener producciones", error });
    }
};
exports.obtenerProduccionesPorStock = obtenerProduccionesPorStock;
const normalizarStock = async (req, res) => {
    try {
        // Obtener todos los registros de stock
        const stocks = await stockModel_1.default.find();
        // Eliminar todas las producciones existentes
        await produccionModel_1.default.deleteMany({});
        console.log("Todas las producciones anteriores han sido eliminadas.");
        for (const stock of stocks) {
            const idStock = stock._id;
            // Calcular la cantidad total entregada para este idStock
            const pedidosEntregados = await pedidosModel_1.default.aggregate([
                { $unwind: "$productos" }, // Descomponer el array de productos
                { $match: { "productos.idStock": idStock, estado: "entregado" } }, // Filtrar por idStock y estado entregado
                {
                    $group: {
                        _id: "$productos.idStock",
                        totalEntregado: { $sum: "$productos.cantidad" }, // Sumar las cantidades entregadas
                    },
                },
            ]);
            const cantidadEntregada = pedidosEntregados.length > 0 ? pedidosEntregados[0].totalEntregado : 0;
            // Insertar un registro inicial en la colección Produccion
            await produccionModel_1.default.create({
                idStock,
                fecha: new Date(),
                cantidad: cantidadEntregada, // Inicializar con la suma entregada
                responsable: "Inicialización automática",
            });
            console.log(`Producción inicial creada para idStock ${idStock}: ${cantidadEntregada}`);
            // Calcular el nuevo stock actual basado en la producción inicial y entregas
            const cantidadActual = stock.cantidad_actual - cantidadEntregada;
            console.log(`idStock: ${idStock}, cantidadEntregada: ${cantidadEntregada}, cantidadActual: ${cantidadActual}`);
            // Actualizar el stock en la base de datos
            await stockModel_1.default.findByIdAndUpdate(idStock, {
                cantidad_actual: cantidadEntregada,
            }, { new: true });
        }
        res.status(200).json({
            message: "Producción inicial creada y stock normalizado correctamente.",
        });
    }
    catch (error) {
        console.error("Error al normalizar el stock:", error);
        res.status(500).json({ message: "Error al normalizar el stock", error });
    }
};
exports.normalizarStock = normalizarStock;
const actualizarStock = async (req, res) => {
    try {
        const { idStock, cantidad, responsable } = req.body;
        if (!idStock || cantidad === undefined || !responsable) {
            res.status(400).json({ message: "Faltan datos requeridos." });
            return;
        }
        // Obtener el registro de stock
        const stock = await stockModel_1.default.findById(idStock);
        if (!stock) {
            res
                .status(404)
                .json({ message: `Stock con ID ${idStock} no encontrado.` });
            return;
        }
        // Calcular la nueva cantidad actual
        const nuevaCantidadActual = stock.cantidad_actual + cantidad;
        // Insertar un nuevo registro en Produccion
        await produccionModel_1.default.create({
            idStock,
            fecha: new Date(),
            cantidad,
            responsable,
        });
        console.log(`Producción registrada para idStock ${idStock}: ${cantidad}`);
        // Actualizar la cantidad actual en el registro de Stock
        await stockModel_1.default.findByIdAndUpdate(idStock, { cantidad_actual: nuevaCantidadActual }, { new: true });
        console.log(`Stock actualizado para idStock ${idStock}: cantidad_actual = ${nuevaCantidadActual}`);
        res.status(200).json({
            message: "Stock actualizado correctamente.",
            nuevaCantidadActual,
        });
    }
    catch (error) {
        console.error("Error al actualizar el stock:", error);
        res.status(500).json({ message: "Error al actualizar el stock.", error });
    }
};
exports.actualizarStock = actualizarStock;
