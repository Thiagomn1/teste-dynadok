import { describe, it, expect, beforeEach } from "@jest/globals";
import { ListarClientesUseCase } from "../../../application/use-cases/cliente/ListarClientesUseCase";
import { Cliente } from "../../../domain/entities/Cliente";
import { MockRepository } from "../../mocks/MockRepository";
import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";

class MockClienteRepository
  extends MockRepository<Cliente>
  implements IClienteRepository
{
  async findByEmail(_email: string): Promise<Cliente | null> {
    return null;
  }

  async findByNome(_nome: string): Promise<Cliente[]> {
    return [];
  }

  async findByTelefone(_telefone: string): Promise<Cliente | null> {
    return null;
  }
}

describe("ListarClientesUseCase", () => {
  let useCase: ListarClientesUseCase;
  let repository: MockClienteRepository;

  beforeEach(() => {
    repository = new MockClienteRepository();
    useCase = new ListarClientesUseCase(repository);
  });

  it("deve retornar lista vazia quando não há clientes", async () => {
    const result = await useCase.execute();

    expect(result.clientes).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("deve listar todos os clientes cadastrados", async () => {
    await repository.create(
      new Cliente("João Silva", "joao@example.com", "(11) 98765-4321")
    );
    await repository.create(
      new Cliente("Maria Santos", "maria@example.com", "(11) 91234-5678")
    );
    await repository.create(
      new Cliente("Pedro Costa", "pedro@example.com", "(21) 98765-4321")
    );

    const result = await useCase.execute();

    expect(result.clientes).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it("deve retornar clientes com todos os campos corretos", async () => {
    const cliente = new Cliente(
      "Ana Silva",
      "ana@example.com",
      "(11) 98765-4321"
    );
    await repository.create(cliente);

    const result = await useCase.execute();

    expect(result.clientes[0]).toMatchObject({
      nome: "Ana Silva",
      email: "ana@example.com",
      telefone: "(11) 98765-4321",
    });
    expect(result.clientes[0].id).toBeDefined();
    expect(result.clientes[0].createdAt).toBeInstanceOf(Date);
    expect(result.clientes[0].updatedAt).toBeInstanceOf(Date);
  });

  it("deve retornar total correto mesmo com muitos clientes", async () => {
    for (let i = 0; i < 10; i++) {
      await repository.create(
        new Cliente(
          `Cliente ${i}`,
          `cliente${i}@example.com`,
          "(11) 98765-4321"
        )
      );
    }

    const result = await useCase.execute();

    expect(result.total).toBe(10);
    expect(result.clientes).toHaveLength(10);
  });
});
