import { describe, it, expect, beforeEach } from "@jest/globals";
import { Cliente } from "../../../domain/entities/Cliente";
import { MockRepository } from "../../mocks/MockRepository";
import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";

class MockClienteRepository
  extends MockRepository<Cliente>
  implements IClienteRepository
{
  async findByEmail(email: string): Promise<Cliente | null> {
    const all = await this.findAll();
    return all.find((c) => c.email === email) || null;
  }

  async findByNome(nome: string): Promise<Cliente[]> {
    const all = await this.findAll();
    return all.filter((c) =>
      c.nome.toLowerCase().includes(nome.toLowerCase())
    );
  }

  async findByTelefone(telefone: string): Promise<Cliente | null> {
    const all = await this.findAll();
    return all.find((c) => c.telefone === telefone) || null;
  }
}

describe("ClienteRepository", () => {
  let repository: MockClienteRepository;

  beforeEach(() => {
    repository = new MockClienteRepository();
    repository.clear();
  });

  it("deve buscar cliente por email", async () => {
    const cliente = new Cliente(
      "João Silva",
      "joao@example.com",
      "(11) 98765-4321"
    );
    await repository.create(cliente);

    const found = await repository.findByEmail("joao@example.com");

    expect(found).not.toBeNull();
    expect(found?.nome).toBe("João Silva");
  });

  it("deve retornar null se email não existir", async () => {
    const found = await repository.findByEmail("inexistente@example.com");

    expect(found).toBeNull();
  });

  it("deve buscar clientes por nome (pesquisa parcial)", async () => {
    await repository.create(
      new Cliente("João Silva", "joao@example.com", "(11) 98765-4321")
    );
    await repository.create(
      new Cliente("João Santos", "joaos@example.com", "(11) 91234-5678")
    );
    await repository.create(
      new Cliente("Maria Silva", "maria@example.com", "(21) 98765-4321")
    );

    const found = await repository.findByNome("João");

    expect(found).toHaveLength(2);
    expect(found[0].nome).toContain("João");
    expect(found[1].nome).toContain("João");
  });

  it("deve buscar clientes por nome case-insensitive", async () => {
    await repository.create(
      new Cliente("João Silva", "joao@example.com", "(11) 98765-4321")
    );

    const found = await repository.findByNome("joão");

    expect(found).toHaveLength(1);
  });

  it("deve retornar array vazio se nome não encontrado", async () => {
    const found = await repository.findByNome("Inexistente");

    expect(found).toEqual([]);
  });

  it("deve buscar cliente por telefone", async () => {
    const cliente = new Cliente(
      "Pedro Costa",
      "pedro@example.com",
      "(21) 98765-4321"
    );
    await repository.create(cliente);

    const found = await repository.findByTelefone("(21) 98765-4321");

    expect(found).not.toBeNull();
    expect(found?.nome).toBe("Pedro Costa");
  });

  it("deve retornar null se telefone não existir", async () => {
    const found = await repository.findByTelefone("(99) 99999-9999");

    expect(found).toBeNull();
  });

  it("deve criar cliente e retornar com ID gerado", async () => {
    const cliente = new Cliente(
      "Ana Silva",
      "ana@example.com",
      "(11) 98765-4321"
    );

    const created = await repository.create(cliente);

    expect(created.id).toBeDefined();
    expect(created.nome).toBe("Ana Silva");
    expect(created.createdAt).toBeInstanceOf(Date);
  });

  it("deve permitir múltiplos clientes com telefones diferentes", async () => {
    await repository.create(
      new Cliente("Cliente 1", "email1@example.com", "(11) 98765-4321")
    );
    await repository.create(
      new Cliente("Cliente 2", "email2@example.com", "(21) 91234-5678")
    );

    const all = await repository.findAll();

    expect(all).toHaveLength(2);
  });
});
