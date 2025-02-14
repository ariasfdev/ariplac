"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stockController_1 = require("../controller/stockController");
const router = (0, express_1.Router)();
// Stock endpoints
router.get("/norma", stockController_1.normalizarStock); // Coloca las rutas específicas primero
router.get("/", stockController_1.getAllStocks);
router.post("/", stockController_1.createStock);
router.get("/:id", stockController_1.getStockById); // Las rutas dinámicas van después
router.get("/importacion/:idVendedor", stockController_1.getAllStocksImportacion);
router.put("/:id", stockController_1.updateStock);
router.delete("/:id", stockController_1.deleteStock);
// Producción endpoints
router.post("/actualizar-stock", stockController_1.actualizarStock);
router.post("/produccion", stockController_1.agregarProduccion);
router.put("/produccion/entrega", stockController_1.registrarEntrega);
router.get("/produccion/:idStock", stockController_1.obtenerProduccionesPorStock);
exports.default = router;
