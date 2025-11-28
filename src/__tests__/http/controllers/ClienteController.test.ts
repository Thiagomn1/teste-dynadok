import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { ClienteController } from "../../../http/controllers/ClienteController";
import { CriarClienteUseCase } from "../../../application/use-cases/cliente/CriarClienteUseCase";
import { BuscarClientePorIdUseCase } from "../../../application/use-cases/cliente/BuscarClientePorIdUseCase";
import { ListarClientesUseCase } from "../../../application/use-cases/cliente/ListarClientesUseCase";
import { AtualizarClienteUseCase } from "../../../application/use-cases/cliente/AtualizarClienteUseCase";
import { NotFoundError } from "../../../shared/types/errors";

describe("ClienteController", () => {
  let controller: ClienteController;
  let mockCriarUseCase: jest.Mocked<CriarClienteUseCase>;
  let mockBuscarUseCase: jest.Mocked<BuscarClientePorIdUseCase>;
  let mockListarUseCase: jest.Mocked<ListarClientesUseCase>;
  let mockAtualizarUseCase: jest.Mocked<AtualizarClienteUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCriarUseCase = {
      execute: jest.fn(),
    } as any;

    mockBuscarUseCase = {
      execute: jest.fn(),
    } as any;

    mockListarUseCase = {
      execute: jest.fn(),
    } as any;

    mockAtualizarUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new ClienteController(
      mockCriarUseCase,
      mockBuscarUseCase,
      mockListarUseCase,
      mockAtualizarUseCase
    );

    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn<any>().mockReturnThis(),
      json: jest.fn<any>().mockReturnThis(),
    } as any;

    mockNext = jest.fn();
  });

  describe("create", () => {
    it("deve criar cliente e retornar 201", async () => {
      const clienteData = {
        nome: "João Silva",
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
      };

      const createdCliente = {
        id: "123",
        ...clienteData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.body = clienteData;
      mockCriarUseCase.execute.mockResolvedValue(createdCliente);

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCriarUseCase.execute).toHaveBeenCalledWith(clienteData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdCliente,
        message: "Cliente criado com sucesso",
      });
    });

    it("deve chamar next com erro em caso de falha", async () => {
      const error = new Error("Database error");
      mockCriarUseCase.execute.mockRejectedValue(error);

      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("findById", () => {
    it("deve buscar cliente por ID e retornar 200", async () => {
      const cliente = {
        id: "123",
        nome: "João Silva",
        email: "joao@example.com",
        telefone: "(11) 98765-4321",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: "123" };
      mockBuscarUseCase.execute.mockResolvedValue(cliente);

      await controller.findById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockBuscarUseCase.execute).toHaveBeenCalledWith({ id: "123" });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: cliente,
      });
    });

    it("deve chamar next com NotFoundError se cliente não existe", async () => {
      const error = new NotFoundError("Cliente", "123");
      mockBuscarUseCase.execute.mockRejectedValue(error);

      mockRequest.params = { id: "123" };

      await controller.findById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("findAll", () => {
    it("deve listar todos os clientes e retornar 200", async () => {
      const clientes = [
        {
          id: "1",
          nome: "Cliente 1",
          email: "cliente1@example.com",
          telefone: "(11) 11111-1111",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          nome: "Cliente 2",
          email: "cliente2@example.com",
          telefone: "(11) 22222-2222",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockListarUseCase.execute.mockResolvedValue({
        clientes,
        total: 2,
      });

      await controller.findAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockListarUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: clientes,
        total: 2,
      });
    });

    it("deve retornar lista vazia se não há clientes", async () => {
      mockListarUseCase.execute.mockResolvedValue({
        clientes: [],
        total: 0,
      });

      await controller.findAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        total: 0,
      });
    });
  });

  describe("update", () => {
    it("deve atualizar cliente e retornar 200", async () => {
      const updateData = {
        nome: "João Silva Santos",
        telefone: "(11) 91234-5678",
      };

      const updatedCliente = {
        id: "123",
        nome: "João Silva Santos",
        email: "joao@example.com",
        telefone: "(11) 91234-5678",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: "123" };
      mockRequest.body = updateData;
      mockAtualizarUseCase.execute.mockResolvedValue(updatedCliente);

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockAtualizarUseCase.execute).toHaveBeenCalledWith({
        id: "123",
        ...updateData,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedCliente,
        message: "Cliente atualizado com sucesso",
      });
    });

    it("deve chamar next com erro em caso de falha", async () => {
      const error = new NotFoundError("Cliente", "123");
      mockAtualizarUseCase.execute.mockRejectedValue(error);

      mockRequest.params = { id: "123" };

      await controller.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
