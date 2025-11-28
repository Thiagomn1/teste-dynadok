import { Cliente } from "@domain/entities/Cliente";
import { IBaseRepository } from "./IBaseRepository";

/**
 * IClienteRepository
 *
 * Interface que define o contrato específico para o repositório de clientes.
 * Estende IBaseRepository e adiciona métodos específicos para a entidade Cliente.
 */
export interface IClienteRepository extends IBaseRepository<Cliente> {
  /**
   * Busca um cliente pelo email
   * @param email - Email do cliente
   * @returns Promise com o cliente encontrado ou null se não existir
   */
  findByEmail(email: string): Promise<Cliente | null>;

  /**
   * Busca clientes pelo nome (pesquisa parcial)
   * @param nome - Nome ou parte do nome do cliente
   * @returns Promise com array de clientes encontrados
   */
  findByNome(nome: string): Promise<Cliente[]>;

  /**
   * Busca um cliente pelo telefone
   * @param telefone - Telefone do cliente
   * @returns Promise com o cliente encontrado ou null se não existir
   */
  findByTelefone(telefone: string): Promise<Cliente | null>;
}
