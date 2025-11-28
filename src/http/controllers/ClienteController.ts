import { Request, Response, NextFunction } from "express";
import { CriarClienteUseCase } from "@application/use-cases/cliente/CriarClienteUseCase";
import { BuscarClientePorIdUseCase } from "@application/use-cases/cliente/BuscarClientePorIdUseCase";
import { ListarClientesUseCase } from "@application/use-cases/cliente/ListarClientesUseCase";
import { AtualizarClienteUseCase } from "@application/use-cases/cliente/AtualizarClienteUseCase";

export class ClienteController {
  constructor(
    private readonly criarClienteUseCase: CriarClienteUseCase,
    private readonly buscarClientePorIdUseCase: BuscarClientePorIdUseCase,
    private readonly listarClientesUseCase: ListarClientesUseCase,
    private readonly atualizarClienteUseCase: AtualizarClienteUseCase
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, email, telefone } = req.body;

      const cliente = await this.criarClienteUseCase.execute({
        nome,
        email,
        telefone,
      });

      res.status(201).json({
        success: true,
        data: cliente,
        message: "Cliente criado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const cliente = await this.buscarClientePorIdUseCase.execute({ id });

      res.status(200).json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.listarClientesUseCase.execute();

      res.status(200).json({
        success: true,
        data: result.clientes,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, email, telefone } = req.body;

      const cliente = await this.atualizarClienteUseCase.execute({
        id,
        nome,
        email,
        telefone,
      });

      res.status(200).json({
        success: true,
        data: cliente,
        message: "Cliente atualizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }
}
