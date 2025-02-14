"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nuevoModelo = exports.editarModelo = exports.obtenerModelos = exports.inicializarModelos = void 0;
const modelosModel_1 = __importDefault(require("../models/modelosModel"));
// Lista de modelos iniciales
const modelosIniciales = [
    { producto: "Placa de yeso", modelo: "MAYA" },
    { producto: "Placa de yeso", modelo: "TRAVERTINO" },
    { producto: "Placa de yeso", modelo: "PANAL" },
    { producto: "Placa de yeso", modelo: "LORETO" },
    { producto: "Placa de yeso", modelo: "TECNO" },
    { producto: "Placa de yeso", modelo: "BURBUJA" },
    { producto: "Placa de yeso", modelo: "BARILOCHE" },
    { producto: "Placa de yeso", modelo: "FLOR" },
    { producto: "Placa de yeso", modelo: "LAJA" },
    { producto: "Placa de yeso", modelo: "PIZARRA" },
    { producto: "Placa de yeso", modelo: "ONDAS" },
    { producto: "Placa de yeso", modelo: "QUEBRACHO" },
    { producto: "Placa de telgopor", modelo: "VALENCI" },
    { producto: "Placa de telgopor", modelo: "QATAR" },
    { producto: "Placa de telgopor", modelo: "SOL" },
    { producto: "Placa de telgopor", modelo: "TELGO 35mm" },
    { producto: "Placa de telgopor", modelo: "TELGO 40mm" },
    { producto: "Placa de telgopor", modelo: "VIRGINIA" },
    { producto: "Placa de telgopor", modelo: "QUEBRACHO" },
    { producto: "Placa de telgopor", modelo: "MOLDURAS" },
];
// Agregar modelos iniciales a la base de datos
const inicializarModelos = async (req, res) => {
    try {
        // Mapear los modelos con los campos adicionales
        const modelosConDetalles = modelosIniciales.map((modelo) => ({
            ...modelo,
            ancho: "30cm",
            alto: "30cm",
            tipo: "3D",
        }));
        // Insertar los modelos en la base de datos
        await modelosModel_1.default.insertMany(modelosConDetalles);
        res.status(201).json({ message: "Modelos inicializados correctamente" });
    }
    catch (error) {
        console.error("Error al inicializar los modelos:", error);
        res.status(500).json({ message: "Error al inicializar los modelos", error });
    }
};
exports.inicializarModelos = inicializarModelos;
const obtenerModelos = async (req, res) => {
    try {
        const modelos = await modelosModel_1.default.find();
        res.status(200).json(modelos);
    }
    catch (error) {
        console.error("Error al obtener los modelos:", error);
        res.status(500).json({ message: "Error al obtener los modelos", error });
    }
};
exports.obtenerModelos = obtenerModelos;
const editarModelo = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del modelo a editar
        const updateData = req.body; // Datos actualizados
        // Actualizar el modelo en la base de datos
        const modeloActualizado = await modelosModel_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!modeloActualizado) {
            res.status(404).json({ message: "Modelo no encontrado" });
            return;
        }
        res.status(200).json(modeloActualizado);
    }
    catch (error) {
        console.error("Error al editar el modelo:", error);
        res.status(500).json({ message: "Error al editar el modelo", error });
    }
};
exports.editarModelo = editarModelo;
const nuevoModelo = async (req, res) => {
    try {
        const { _id, ...data } = req.body; // Excluye el campo _id si está presente
        const nuevoModelo = await modelosModel_1.default.create(data); // Crea el modelo sin _id
        res.status(201).json({
            message: "Modelo creado correctamente",
            modelo: nuevoModelo,
        });
    }
    catch (error) {
        console.error("Error al crear el modelo:", error);
        res.status(500).json({
            message: "Error al crear el modelo",
            error,
        });
    }
};
exports.nuevoModelo = nuevoModelo;
