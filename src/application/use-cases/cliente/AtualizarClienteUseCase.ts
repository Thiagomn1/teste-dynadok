import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";
import { ICacheService } from "../../../infrastructure/cache/interfaces/ICacheService";
import { NotFoundError, ConflictError } from "../../../shared/types/errors";
import { IUseCase } from "../interfaces/IUseCase";

export interface AtualizarClienteInput {
  id: string;
  nome?: string;
  email?: string;
  telefone?: string;
}

export interface AtualizarClienteOutput {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AtualizarClienteUseCase
  implements IUseCase<AtualizarClienteInput, AtualizarClienteOutput>
{
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService
  ) {}

  async execute(input: AtualizarClienteInput): Promise<AtualizarClienteOutput> {
    const clienteExistente = await this.clienteRepository.findById(input.id);
    if (!clienteExistente) {
      throw new NotFoundError("Cliente", input.id);
    }

    if (input.email && input.email !== clienteExistente.email) {
      const clienteComEmail = await this.clienteRepository.findByEmail(
        input.email
      );
      if (clienteComEmail) {
        throw new ConflictError("Já existe um cliente com este email");
      }
    }

    const clienteAtualizado = await this.clienteRepository.update(input.id, {
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
    });

    if (!clienteAtualizado) {
      throw new NotFoundError("Cliente", input.id);
    }

    await this.invalidateCache(input.id);

    return {
      id: clienteAtualizado.id!,
      nome: clienteAtualizado.nome,
      email: clienteAtualizado.email,
      telefone: clienteAtualizado.telefone,
      createdAt: clienteAtualizado.createdAt,
      updatedAt: clienteAtualizado.updatedAt,
    };
  }

  private async invalidateCache(clienteId: string): Promise<void> {
    try {
      await this.cacheService.delete(`cliente:${clienteId}`);
    } catch (error) {
      console.error("Erro ao invalidar cache:", error);
    }
  }
}
