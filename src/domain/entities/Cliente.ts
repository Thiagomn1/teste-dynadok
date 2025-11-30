import { BaseEntity } from "@domain/entities/BaseEntity";
import { Validators } from "@shared/utils/validators";

/**
 * Cliente
 *
 * Entidade de domínio que representa um cliente no sistema.
 * Contém as regras de negócio e validações relacionadas a clientes.
 */
export class Cliente extends BaseEntity {
  /**
   * Nome completo do cliente
   */
  public nome: string;

  /**
   * Email do cliente (único no sistema)
   */
  public email: string;

  /**
   * Telefone de contato do cliente
   */
  public telefone: string;

  constructor(nome: string, email: string, telefone: string, id?: string) {
    super(id);
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.validate();
  }

  /**
   * Valida os dados do cliente no momento da criação
   *
   * Validações básicas são feitas aqui para garantir que a entidade
   * não seja criada em estado inválido. Validações mais complexas
   * (como unicidade de email) são responsabilidade dos Use Cases.
   *
   * @throws Error se os dados forem inválidos
   */
  private validate(): void {
    if (!Validators.isNotEmpty(this.nome)) {
      throw new Error("Nome é obrigatório");
    }

    if (!Validators.isValidEmail(this.email)) {
      throw new Error("Email inválido");
    }

    if (!Validators.isValidBrazilianPhone(this.telefone)) {
      throw new Error("Telefone inválido");
    }
  }
}
