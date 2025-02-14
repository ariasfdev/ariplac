"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedidosController_1 = require("../controller/pedidosController");
const router = (0, express_1.Router)();
// Endpoints existentes
router.get("/", pedidosController_1.getPedidos);
router.post("/", pedidosController_1.createPedido);
router.post("/:id/remito", pedidosController_1.uploadRemito);
router.get("/remito/:filename", pedidosController_1.getRemito);
router.put("/entregado/:id", pedidosController_1.cambiarEstadoAEntregado);
// ✅ Nuevo endpoint para editar un pedido
router.put("/editar/:id", pedidosController_1.updatePedido);
exports.default = router;
