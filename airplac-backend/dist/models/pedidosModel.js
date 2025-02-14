"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PedidoSchema = new mongoose_1.Schema({
    remito: { type: String },
    vendedor_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Vendedores",
        required: true,
    },
    cliente: {
        nombre: { type: String },
        direccion: { type: String },
        contacto: { type: String },
    },
    productos: [
        {
            idStock: { type: mongoose_1.Schema.Types.ObjectId, ref: "Stock", required: true },
            idModelo: { type: mongoose_1.Schema.Types.ObjectId, ref: "Modelos", required: true },
            cantidad: { type: Number, required: true },
            unidad: { type: String, required: true },
            materiales: {
                type: String,
                enum: [
                    "con materiales",
                    "con pegamento",
                    "con sella junta",
                    "sin materiales",
                ],
            },
        },
    ],
    estado: {
        type: String,
        required: true,
        enum: [
            "pendiente",
            "entregado",
            "instalacion",
            "disponible",
            "retira",
            "enviar",
            "remitado",
        ], // Estados permitidos
    },
    fecha_pedido: { type: Date, required: true },
    fecha_entrega_estimada: { type: Date, required: true },
    demora_calculada: { type: Number, required: true },
    metodo_pago: {
        type: String,
        required: true,
        enum: ["efectivo", "transferencia", "debito", "credito"], // Métodos de pago permitidos
    },
    procedencia: {
        type: String,
        required: true,
        enum: [
            "tiktok",
            "facebook",
            "instagram",
            "recomendado",
            "local",
            "anuncio",
        ], // Procedencias permitidas
    },
    flete: { type: Number },
    descuento: { type: Number },
    adelanto: { type: Number },
    total: { type: Number, required: true },
    remitos: [
        {
            url: { type: String },
            fecha: { type: Date, default: Date.now },
        },
    ],
});
// Forzar el uso de la colección "Pedidos"
exports.default = mongoose_1.default.model("Pedido", PedidoSchema, "Pedidos");
