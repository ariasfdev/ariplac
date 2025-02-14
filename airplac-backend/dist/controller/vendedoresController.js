"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVendedor = exports.createVendedor = void 0;
const vendedoresModel_1 = __importDefault(require("../models/vendedoresModel"));
const createVendedor = async (req, res) => {
    try {
        const { nombre, usuario, rango, email } = req.body;
        const nuevoVendedor = new vendedoresModel_1.default({
            nombre,
            usuario,
            email,
            rango,
            pedidos_realizados: []
        });
        const vendedorGuardado = await nuevoVendedor.save();
        res.status(201).json(vendedorGuardado);
    }
    catch (error) {
        console.error('Error al crear el vendedor:', error);
        res.status(500).json({ message: 'Error al crear el vendedor', error });
    }
};
exports.createVendedor = createVendedor;
const deleteVendedor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendedorEliminado = await vendedoresModel_1.default.findByIdAndDelete(id);
        if (!vendedorEliminado) {
            res.status(404).json({ message: 'Vendedor no encontrado' });
            return;
        }
        res.status(200).json({ message: 'Vendedor eliminado exitosamente', vendedorEliminado });
    }
    catch (error) {
        console.error('Error al eliminar el vendedor:', error);
        res.status(500).json({ message: 'Error al eliminar el vendedor', error });
    }
};
exports.deleteVendedor = deleteVendedor;
