import { Router } from "express";
import { ClienteController } from "@http/controllers/ClienteController";
import { validateRequest } from "@http/middlewares/requestValidator";

export function createClienteRoutes(
  clienteController: ClienteController
): Router {
  const router = Router();

  router.post(
    "/",
    validateRequest({
      body: {
        nome: {
          required: true,
          type: "string",
          minLength: 3,
          maxLength: 100,
        },
        email: {
          required: true,
          type: "email",
        },
        telefone: {
          required: true,
          type: "phone",
        },
      },
    }),
    (req, res, next) => clienteController.create(req, res, next)
  );

  router.get("/:id", (req, res, next) =>
    clienteController.findById(req, res, next)
  );

  router.get("/", (req, res, next) =>
    clienteController.findAll(req, res, next)
  );

  router.put(
    "/:id",
    validateRequest({
      body: {
        nome: {
          required: false,
          type: "string",
          minLength: 3,
          maxLength: 100,
        },
        email: {
          required: false,
          type: "email",
        },
        telefone: {
          required: false,
          type: "phone",
        },
      },
    }),
    (req, res, next) => clienteController.update(req, res, next)
  );

  return router;
}
