import { describe, it, expect, beforeEach } from "@jest/globals";
import { ListarClientesUseCase } from "../../../application/use-cases/cliente/ListarClientesUseCase";
import { Cliente } from "../../../domain/entities/Cliente";
import { MockRepository } from "../../mocks/MockRepository";
import { MockCacheService } from "../../mocks/MockCacheService";
import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";

class MockClienteRepository
  extends MockRepository<Cliente>
  implements IClienteRepository
{
  async findByEmail(_email: string): Promise<Cliente | null> {
    return null;
  }
}

describe("ListarClientesUseCase", () => {
  let useCase: ListarClientesUseCase;
  let repository: MockClienteRepository;
  let cacheService: MockCacheService;

  beforeEach(() => {
    repository = new MockClienteRepository();
    cacheService = new MockCacheService();
    useCase = new ListarClientesUseCase(repository, cacheService);
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

  it("deve salvar lista no cache após buscar do banco", async () => {
    await repository.create(
      new Cliente("João Silva", "joao@example.com", "(11) 98765-4321")
    );

    const result = await useCase.execute();

    expect(result.clientes).toHaveLength(1);

    const cached = await cacheService.get("clientes:list");
    expect(cached).toBeDefined();
    expect(cached).toEqual(result);
  });

  it("deve retornar dados do cache se disponível", async () => {
    const cachedData = {
      clientes: [
        {
          id: "cached-id",
          nome: "Cliente Cached",
          email: "cached@example.com",
          telefone: "(11) 98765-4321",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    };

    await cacheService.set("clientes:list", cachedData, 300);

    await repository.create(
      new Cliente("João Silva", "joao@example.com", "(11) 98765-4321")
    );

    const result = await useCase.execute();

    expect(result).toEqual(cachedData);
    expect(result.clientes[0].id).toBe("cached-id");
  });

  it("deve buscar do banco se cache estiver vazio", async () => {
    await repository.create(
      new Cliente("João Silva", "joao@example.com", "(11) 98765-4321")
    );

    await cacheService.delete("clientes:list");

    const result = await useCase.execute();

    expect(result.clientes).toHaveLength(1);
    expect(result.clientes[0].nome).toBe("João Silva");
  });
});
