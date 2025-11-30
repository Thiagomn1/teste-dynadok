import { IClienteRepository } from "@domain/repositories/IClienteRepository";
import { ICacheService } from "@infrastructure/cache/interfaces/ICacheService";
import { NotFoundError } from "@shared/types/errors";
import { IUseCase } from "@application/use-cases/interfaces/IUseCase";
import { ClienteResponseDTO } from "@application/dtos/ClienteDTO";
import { CacheTTL, CacheKeys } from "@shared/constants/cache";

export interface BuscarClientePorIdInput {
  id: string;
}

export class BuscarClientePorIdUseCase
  implements IUseCase<BuscarClientePorIdInput, ClienteResponseDTO>
{

  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService
  ) {}

  async execute(input: BuscarClientePorIdInput): Promise<ClienteResponseDTO> {
    const cacheKey = CacheKeys.CLIENTE_BY_ID(input.id);

    const cachedCliente = await this.getFromCache(cacheKey);
    if (cachedCliente) {
      console.log(`Cliente ${input.id} obtido do cache`);
      return cachedCliente;
    }

    const cliente = await this.clienteRepository.findById(input.id);
    if (!cliente) {
      throw new NotFoundError("Cliente", input.id);
    }

    const output: ClienteResponseDTO = {
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

  private async getFromCache(key: string): Promise<ClienteResponseDTO | null> {
    try {
      return await this.cacheService.get<ClienteResponseDTO>(key);
    } catch (error) {
      console.error("Erro ao buscar no cache:", error);
      return null;
    }
  }

  private async saveToCache(
    key: string,
    data: ClienteResponseDTO
  ): Promise<void> {
    try {
      await this.cacheService.set(key, data, CacheTTL.SHORT);
    } catch (error) {
      console.error("Erro ao salvar no cache:", error);
    }
  }
}
