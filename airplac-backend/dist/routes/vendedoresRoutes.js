"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendedoresController_1 = require("../controller/vendedoresController");
const router = (0, express_1.Router)();
router.post('/', vendedoresController_1.createVendedor);
router.delete('/:id', vendedoresController_1.deleteVendedor);
exports.default = router;
