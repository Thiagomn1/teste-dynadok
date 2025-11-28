import { IClienteRepository } from "@domain/repositories/IClienteRepository";
import { IUseCase } from "@application/use-cases/interfaces/IUseCase";
import { ListClientesResponseDTO } from "@application/dtos/ClienteDTO";

export class ListarClientesUseCase
  implements IUseCase<void, ListClientesResponseDTO>
{
  constructor(private readonly clienteRepository: IClienteRepository) {}

  async execute(): Promise<ListClientesResponseDTO> {
    const clientes = await this.clienteRepository.findAll();

    const clientesList = clientes.map((cliente) => ({
      id: cliente.id!,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,
    }));

    return {
      clientes: clientesList,
      total: clientesList.length,
    };
  }
}
