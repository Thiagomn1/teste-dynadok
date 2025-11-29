import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { requestLogger } from "../../../http/middlewares/requestLogger";

describe("requestLogger middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: "GET",
      url: "/api/clientes",
      ip: "127.0.0.1",
      get: jest.fn<any>().mockReturnValue("Jest Test Agent"),
    };
    mockResponse = {
      statusCode: 200,
      on: jest.fn<any>(),
    };
    mockNext = jest.fn<any>();
  });

  it("deve logar requisição e chamar next", () => {
    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it("deve configurar listener no evento finish da response", () => {
    requestLogger(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.on).toHaveBeenCalledWith("finish", expect.any(Function));
  });
});
