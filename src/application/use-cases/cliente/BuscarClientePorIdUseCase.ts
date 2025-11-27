import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";
import { ICacheService } from "../../../infrastructure/cache/interfaces/ICacheService";
import { NotFoundError } from "../../../shared/types/errors";
import { IUseCase } from "../interfaces/IUseCase";

export interface BuscarClientePorIdInput {
  id: string;
}

export interface BuscarClientePorIdOutput {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BuscarClientePorIdUseCase
  implements IUseCase<BuscarClientePorIdInput, BuscarClientePorIdOutput>
{
  private readonly CACHE_TTL = 3600; // 1 hora
  private readonly CACHE_PREFIX = "cliente:";

  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService
  ) {}

  async execute(
    input: BuscarClientePorIdInput
  ): Promise<BuscarClientePorIdOutput> {
    const cacheKey = `${this.CACHE_PREFIX}${input.id}`;

    const cachedCliente = await this.getFromCache(cacheKey);
    if (cachedCliente) {
      console.log(`Cliente ${input.id} obtido do cache`);
      return cachedCliente;
    }

    const cliente = await this.clienteRepository.findById(input.id);
    if (!cliente) {
      throw new NotFoundError("Cliente", input.id);
    }

    const output: BuscarClientePorIdOutput = {
      id: cliente.id!,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,
    };

    await this.saveToCache(cacheKey, output);

    console.log(`Cliente ${input.id} obtido do banco e salvo no cache`);
    return output;
  }

  private async getFromCache(
    key: string
  ): Promise<BuscarClientePorIdOutput | null> {
    try {
      return await this.cacheService.get<BuscarClientePorIdOutput>(key);
    } catch (error) {
      console.error("Erro ao buscar no cache:", error);
      return null;
    }
  }

  private async saveToCache(
    key: string,
    data: BuscarClientePorIdOutput
  ): Promise<void> {
    try {
      await this.cacheService.set(key, data, this.CACHE_TTL);
    } catch (error) {
      console.error("Erro ao salvar no cache:", error);
    }
  }
}
