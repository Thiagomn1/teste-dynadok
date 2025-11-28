import { IClienteRepository } from "@domain/repositories/IClienteRepository";
import { ICacheService } from "@infrastructure/cache/interfaces/ICacheService";
import { IUseCase } from "@application/use-cases/interfaces/IUseCase";
import { ListClientesResponseDTO } from "@application/dtos/ClienteDTO";

export class ListarClientesUseCase
  implements IUseCase<void, ListClientesResponseDTO>
{
  private readonly CACHE_TTL = 300; // 5 minutos
  private readonly CACHE_PREFIX = "clientes:list";

  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService
  ) {}

  async execute(): Promise<ListClientesResponseDTO> {
    const cached = await this.cacheService.get<ListClientesResponseDTO>(
      this.CACHE_PREFIX
    );

    if (cached) {
      console.log("Lista de clientes obtida do cache");
      return cached;
    }

    const clientes = await this.clienteRepository.findAll();

    const response: ListClientesResponseDTO = {
      clientes: clientes.map((cliente) => ({
        id: cliente.id!,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt,
      })),
      total: clientes.length,
    };

    await this.cacheService.set(this.CACHE_PREFIX, response, this.CACHE_TTL);
    console.log("Lista de clientes salva no cache");

    return response;
  }
}
