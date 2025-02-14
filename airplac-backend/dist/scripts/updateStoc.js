"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const stockModel_1 = __importDefault(require("../models/stockModel")); // Asegúrate de importar tu modelo Stock
const modelosModel_1 = __importDefault(require("../models/modelosModel")); // Asegúrate de importar tu modelo Modelo
const actualizarStock = async () => {
    try {
        // Conectar a la base de datos
        await mongoose_1.default.connect("mongodb://localhost:27017/airplac");
        console.log("Conectado a la base de datos");
        // Obtener todos los registros de Stock
        const stocks = await stockModel_1.default.find();
        if (stocks.length === 0) {
            console.log("No hay registros en la colección Stock");
            return;
        }
        // Recorrer los registros de Stock y actualizar con idModelo y stockActivo
        for (const stock of stocks) {
            // Buscar el modelo correspondiente en la colección Modelos
            const modelo = await modelosModel_1.default.findOne({
                producto: stock.producto,
                modelo: stock.modelo,
            });
            if (!modelo) {
                console.error(`No se encontró un modelo para el producto ${stock.producto} y modelo ${stock.modelo}`);
                continue;
            }
            // Actualizar el registro de Stock
            await stockModel_1.default.updateOne({ _id: stock._id }, // Filtro por el ID del registro
            {
                $set: {
                    idModelo: modelo._id, // Asigna el ID del modelo
                    stockActivo: true, // Marca el registro como activo
                },
            });
            console.log(`Stock actualizado: ${stock._id}`);
        }
        console.log("Actualización completada");
    }
    catch (error) {
        console.error("Error durante la actualización:", error);
    }
    finally {
        // Cerrar la conexión con la base de datos
        mongoose_1.default.connection.close();
    }
};
// Ejecutar el script
actualizarStock();
