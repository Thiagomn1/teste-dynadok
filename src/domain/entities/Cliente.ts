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
   * Valida os dados do cliente
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

  /**
   * Atualiza os dados do cliente
   */
  public atualizar(nome?: string, email?: string, telefone?: string): void {
    if (nome) this.nome = nome;
    if (email) this.email = email;
    if (telefone) this.telefone = telefone;

    this.validate();
    this.touch();
  }

  /**
   * Retorna uma representação em objeto simples do cliente
   */
  public toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
