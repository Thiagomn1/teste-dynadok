/**
 * BaseEntity
 *
 * Entidade base que contém campos genéricos compartilhados por todas as entidades do domínio.
 * Seguindo os princípios de Clean Architecture, esta classe representa a camada mais interna
 * e não possui dependências externas.
 */
export abstract class BaseEntity {
  /**
   * Identificador único da entidade
   */
  public id?: string;

  /**
   * Data de criação do registro
   */
  public createdAt: Date;

  /**
   * Data da última atualização do registro
   */
  public updatedAt: Date;

  constructor(id?: string) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Atualiza a data de modificação da entidade
   */
  protected touch(): void {
    this.updatedAt = new Date();
  }
}
