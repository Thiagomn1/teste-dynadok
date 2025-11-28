import { Router } from "express";
import { createClienteRoutes } from "@http/routes/cliente.routes";
import { ClienteController } from "@http/controllers/ClienteController";

export function createRoutes(clienteController: ClienteController): Router {
  const router = Router();

  router.use("/clientes", createClienteRoutes(clienteController));

  return router;
}
