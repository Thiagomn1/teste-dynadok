import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../../http/middlewares/errorHandler";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  ExternalServiceError,
} from "../../../shared/types/errors";

describe("errorHandler middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn<any>().mockReturnThis(),
      json: jest.fn<any>().mockReturnThis(),
    };
    mockNext = jest.fn<any>();
  });

  it("deve retornar 400 para ValidationError", () => {
    const error = new ValidationError("Dados inválidos", [
      "body.email: Email inválido",
    ]);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "ValidationError",
        message: "Dados inválidos",
        details: ["body.email: Email inválido"],
      },
    });
  });

  it("deve retornar 404 para NotFoundError", () => {
    const error = new NotFoundError("Cliente", "123");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "NotFoundError",
        message: "Cliente com identificador '123' não encontrado",
      },
    });
  });

  it("deve retornar 409 para ConflictError", () => {
    const error = new ConflictError("Email já existe");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "ConflictError",
        message: "Email já existe",
      },
    });
  });

  it("deve retornar 401 para UnauthorizedError", () => {
    const error = new UnauthorizedError("Não autorizado");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "UnauthorizedError",
        message: "Não autorizado",
      },
    });
  });

  it("deve retornar 403 para ForbiddenError", () => {
    const error = new ForbiddenError("Acesso negado");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "ForbiddenError",
        message: "Acesso negado",
      },
    });
  });

  it("deve retornar 500 para DatabaseError", () => {
    const error = new DatabaseError("Erro de conexão");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "DatabaseError",
        message: "Erro interno no banco de dados",
      },
    });
  });

  it("deve retornar 503 para ExternalServiceError", () => {
    const error = new ExternalServiceError("Serviço indisponível");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "ExternalServiceError",
        message: "Serviço externo indisponível",
      },
    });
  });

  it("deve retornar 500 para erros genéricos", () => {
    const error = new Error("Erro desconhecido");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        type: "InternalServerError",
        message: "Erro interno do servidor",
      },
    });
  });
});
