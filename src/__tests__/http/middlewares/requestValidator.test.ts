import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { validateRequest } from "../../../http/middlewares/requestValidator";

describe("requestValidator middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn<any>().mockReturnThis(),
      json: jest.fn<any>().mockReturnThis(),
    };
    mockNext = jest.fn<any>();
  });

  describe("validateRequest - criar cliente", () => {
    const validateCreateCliente = validateRequest({
      body: {
        nome: { required: true, type: "string", minLength: 3, maxLength: 100 },
        email: { required: true, type: "email" },
        telefone: { required: true, type: "phone" },
      },
    });

    it("deve passar com dados válidos", () => {
      mockRequest.body = {
        nome: "João Silva",
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
      };

      validateCreateCliente(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve rejeitar sem nome", () => {
      mockRequest.body = {
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
      };

      expect(() => {
        validateCreateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow("Erro de validação");
    });

    it("deve rejeitar nome muito curto", () => {
      mockRequest.body = {
        nome: "Jo",
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
      };

      expect(() => {
        validateCreateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });

    it("deve rejeitar sem email", () => {
      mockRequest.body = {
        nome: "João Silva",
        telefone: "(11) 98765-4321",
      };

      expect(() => {
        validateCreateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });

    it("deve rejeitar email inválido", () => {
      mockRequest.body = {
        nome: "João Silva",
        email: "email-invalido",
        telefone: "(11) 98765-4321",
      };

      expect(() => {
        validateCreateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });

    it("deve rejeitar sem telefone", () => {
      mockRequest.body = {
        nome: "João Silva",
        email: "joao@example.com",
      };

      expect(() => {
        validateCreateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });

    it("deve rejeitar telefone inválido", () => {
      mockRequest.body = {
        nome: "João Silva",
        email: "joao@example.com",
        telefone: "123456",
      };

      expect(() => {
        validateCreateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });
  });

  describe("validateRequest - atualizar cliente", () => {
    const validateUpdateCliente = validateRequest({
      body: {
        nome: { required: false, type: "string", minLength: 3, maxLength: 100 },
        email: { required: false, type: "email" },
        telefone: { required: false, type: "phone" },
      },
    });

    it("deve passar com todos os campos válidos", () => {
      mockRequest.body = {
        nome: "João Silva",
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
      };

      validateUpdateCliente(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve passar com corpo vazio (todos campos opcionais)", () => {
      mockRequest.body = {};

      validateUpdateCliente(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("deve rejeitar nome muito curto", () => {
      mockRequest.body = {
        nome: "Jo",
      };

      expect(() => {
        validateUpdateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });

    it("deve rejeitar email inválido", () => {
      mockRequest.body = {
        email: "email-invalido",
      };

      expect(() => {
        validateUpdateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });

    it("deve rejeitar telefone inválido", () => {
      mockRequest.body = {
        telefone: "123456",
      };

      expect(() => {
        validateUpdateCliente(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      }).toThrow();
    });
  });
});
