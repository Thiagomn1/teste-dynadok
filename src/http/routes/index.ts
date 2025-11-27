import { Router } from "express";
import { createClienteRoutes } from "./cliente.routes";
import { ClienteController } from "../controllers/ClienteController";

export function createRoutes(clienteController: ClienteController): Router {
  const router = Router();

  router.use("/clientes", createClienteRoutes(clienteController));

  return router;
}
