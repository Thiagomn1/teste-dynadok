import { describe, it, expect, beforeEach } from "@jest/globals";
import { BuscarClientePorIdUseCase } from "../../../application/use-cases/cliente/BuscarClientePorIdUseCase";
import { Cliente } from "../../../domain/entities/Cliente";
import { MockRepository } from "../../mocks/MockRepository";
import { MockCacheService } from "../../mocks/MockCacheService";
import { NotFoundError } from "../../../shared/types/errors";
import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";

class MockClienteRepository
  extends MockRepository<Cliente>
  implements IClienteRepository
{
  async findByEmail(_email: string): Promise<Cliente | null> {
    return null;
  }
}

describe("BuscarClientePorIdUseCase", () => {
  let useCase: BuscarClientePorIdUseCase;
  let repository: MockClienteRepository;
  let cacheService: MockCacheService;

  beforeEach(() => {
    repository = new MockClienteRepository();
    cacheService = new MockCacheService();
    useCase = new BuscarClientePorIdUseCase(repository, cacheService);
  });

  it("deve buscar cliente por ID do banco de dados", async () => {
    const cliente = new Cliente(
      "João Silva",
      "joao@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    const result = await useCase.execute({ id: created.id! });

    expect(result).toMatchObject({
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
    });
  });

  it("deve salvar cliente no cache após buscar do banco", async () => {
    const cliente = new Cliente(
      "Maria Silva",
      "maria@example.com",
      "(11) 91234-5678"
    );
    const created = await repository.create(cliente);

    await useCase.execute({ id: created.id! });

    const cached = await cacheService.get(`cliente:${created.id}`);
    expect(cached).toBeDefined();
    expect(cached).toMatchObject({
      nome: "Maria Silva",
      email: "maria@example.com",
    });
  });

  it("deve retornar cliente do cache se existir", async () => {
    const cachedData = {
      id: "123",
      nome: "Pedro Santos",
      email: "pedro@example.com",
      telefone: "(21) 98765-4321",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await cacheService.set("cliente:123", cachedData);

    const result = await useCase.execute({ id: "123" });

    expect(result).toEqual(cachedData);
  });

  it("deve lançar NotFoundError se cliente não existe", async () => {
    await expect(useCase.execute({ id: "id-inexistente" })).rejects.toThrow(
      NotFoundError
    );
  });
});
