import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";
import { IUseCase } from "../interfaces/IUseCase";

export type ListarClientesInput = void;

export interface ClienteListItem {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListarClientesOutput {
  clientes: ClienteListItem[];
  total: number;
}

export class ListarClientesUseCase
  implements IUseCase<ListarClientesInput, ListarClientesOutput>
{
  constructor(private readonly clienteRepository: IClienteRepository) {}

  async execute(): Promise<ListarClientesOutput> {
    const clientes = await this.clienteRepository.findAll();

    const clientesList: ClienteListItem[] = clientes.map((cliente) => ({
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
