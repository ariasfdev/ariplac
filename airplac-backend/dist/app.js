"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const stockRoutes_1 = __importDefault(require("./routes/stockRoutes"));
const vendedoresRoutes_1 = __importDefault(require("./routes/vendedoresRoutes"));
const pedidosRoutes_1 = __importDefault(require("./routes/pedidosRoutes"));
const modelosRoutes_1 = __importDefault(require("./routes/modelosRoutes"));
const path_1 = __importDefault(require("path"));
// import pedidosRoutes from './routes/pedidosRoutes';
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Rutas
app.use("/api/stock", stockRoutes_1.default);
app.use("/api/vendedores", vendedoresRoutes_1.default);
app.use("/api/pedidos", pedidosRoutes_1.default);
app.use("/api/modelos", modelosRoutes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
exports.default = app;
