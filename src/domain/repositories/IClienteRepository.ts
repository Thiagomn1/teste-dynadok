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
}
