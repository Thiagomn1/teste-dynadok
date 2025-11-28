import { BaseEntity } from "@domain/entities/BaseEntity";

/**
 * IBaseRepository<T>
 *
 * Interface genérica que define o contrato para repositórios.
 * Implementa o padrão Repository, isolando a camada de domínio
 * dos detalhes de implementação de persistência.
 *
 * @template T - Tipo da entidade que estende BaseEntity
 */
export interface IBaseRepository<T extends BaseEntity> {
  /**
   * Cria uma nova entidade no repositório
   * @param entity - Entidade a ser criada
   * @returns Promise com a entidade criada incluindo o ID gerado
   */
  create(entity: T): Promise<T>;

  /**
   * Busca uma entidade por ID
   * @param id - Identificador único da entidade
   * @returns Promise com a entidade encontrada ou null se não existir
   */
  findById(id: string): Promise<T | null>;

  /**
   * Busca todas as entidades do repositório
   * @returns Promise com array de todas as entidades
   */
  findAll(): Promise<T[]>;

  /**
   * Atualiza uma entidade existente
   * @param id - Identificador da entidade a ser atualizada
   * @param entity - Dados atualizados da entidade
   * @returns Promise com a entidade atualizada ou null se não existir
   */
  update(id: string, entity: Partial<T>): Promise<T | null>;

  /**
   * Remove uma entidade do repositório
   * @param id - Identificador da entidade a ser removida
   * @returns Promise com boolean indicando se a remoção foi bem-sucedida
   */
  delete(id: string): Promise<boolean>;

  /**
   * Verifica se uma entidade existe no repositório
   * @param id - Identificador da entidade
   * @returns Promise com boolean indicando se a entidade existe
   */
  exists(id: string): Promise<boolean>;
}
