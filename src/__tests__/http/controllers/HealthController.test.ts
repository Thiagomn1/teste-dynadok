import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import { HealthController } from "../../../http/controllers/HealthController";

jest.mock("../../../infrastructure/database/mongodb/connection");
jest.mock("redis");

describe("HealthController", () => {
  let healthController: HealthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    healthController = new HealthController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn<any>().mockReturnThis(),
      json: jest.fn<any>().mockReturnThis(),
    };
  });

  it("deve retornar status 200 quando todos os serviços estão up", async () => {
    const mockCheckMongoDB = jest
      .spyOn(healthController as any, "checkMongoDB")
      .mockResolvedValue({ status: "up" });
    const mockCheckRedis = jest
      .spyOn(healthController as any, "checkRedis")
      .mockResolvedValue({ status: "up" });

    await healthController.check(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "healthy",
        services: {
          mongodb: { status: "up" },
          redis: { status: "up" },
        },
      })
    );

    mockCheckMongoDB.mockRestore();
    mockCheckRedis.mockRestore();
  });

  it("deve retornar status 503 quando MongoDB está down", async () => {
    const mockCheckMongoDB = jest
      .spyOn(healthController as any, "checkMongoDB")
      .mockResolvedValue({ status: "down", message: "Connection failed" });
    const mockCheckRedis = jest
      .spyOn(healthController as any, "checkRedis")
      .mockResolvedValue({ status: "up" });

    await healthController.check(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        services: {
          mongodb: { status: "down", message: "Connection failed" },
          redis: { status: "up" },
        },
      })
    );

    mockCheckMongoDB.mockRestore();
    mockCheckRedis.mockRestore();
  });

  it("deve retornar status 503 quando Redis está down", async () => {
    const mockCheckMongoDB = jest
      .spyOn(healthController as any, "checkMongoDB")
      .mockResolvedValue({ status: "up" });
    const mockCheckRedis = jest
      .spyOn(healthController as any, "checkRedis")
      .mockResolvedValue({ status: "down", message: "Connection failed" });

    await healthController.check(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(503);

    mockCheckMongoDB.mockRestore();
    mockCheckRedis.mockRestore();
  });

  it("deve incluir timestamp e uptime na resposta", async () => {
    const mockCheckMongoDB = jest
      .spyOn(healthController as any, "checkMongoDB")
      .mockResolvedValue({ status: "up" });
    const mockCheckRedis = jest
      .spyOn(healthController as any, "checkRedis")
      .mockResolvedValue({ status: "up" });

    await healthController.check(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      })
    );

    mockCheckMongoDB.mockRestore();
    mockCheckRedis.mockRestore();
  });
});
