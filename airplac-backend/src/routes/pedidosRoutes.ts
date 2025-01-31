import { Router } from "express";
import { createPedido, getPedidos } from "../controller/pedidosController";

const router = Router();

// Crear un nuevo pedido
router.post("/", createPedido);

// Obtener pedidos
router.get("/", getPedidos);

export default router;
