import { Request, Response, NextFunction } from "express";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  ExternalServiceError,
} from "@shared/types/errors";
import { logger } from "@shared/utils/logger";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error("Erro ocorreu", {
    error: error.message,
    stack: error.stack,
    name: error.name,
  });

  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        type: "ValidationError",
        message: error.message,
        details: error.errors,
      },
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      success: false,
      error: {
        type: "NotFoundError",
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ConflictError) {
    res.status(409).json({
      success: false,
      error: {
        type: "ConflictError",
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(401).json({
      success: false,
      error: {
        type: "UnauthorizedError",
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ForbiddenError) {
    res.status(403).json({
      success: false,
      error: {
        type: "ForbiddenError",
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof DatabaseError) {
    res.status(500).json({
      success: false,
      error: {
        type: "DatabaseError",
        message: "Erro interno no banco de dados",
      },
    });
    return;
  }

  if (error instanceof ExternalServiceError) {
    res.status(503).json({
      success: false,
      error: {
        type: "ExternalServiceError",
        message: "Serviço externo indisponível",
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      type: "InternalServerError",
      message: "Erro interno do servidor",
    },
  });
}
