import { describe, it, expect, beforeEach } from "@jest/globals";
import { CriarClienteUseCase } from "../../../application/use-cases/cliente/CriarClienteUseCase";
import { Cliente } from "../../../domain/entities/Cliente";
import { MockRepository } from "../../mocks/MockRepository";
import { MockMessageProducer } from "../../mocks/MockMessageProducer";
import { MockCacheService } from "../../mocks/MockCacheService";
import { ConflictError, ValidationError } from "../../../shared/types/errors";
import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";

class MockClienteRepository
  extends MockRepository<Cliente>
  implements IClienteRepository
{
  async findByEmail(email: string): Promise<Cliente | null> {
    const all = await this.findAll();
    return all.find((c) => c.email === email) || null;
  }
}

describe("CriarClienteUseCase", () => {
  let useCase: CriarClienteUseCase;
  let repository: MockClienteRepository;
  let messageProducer: MockMessageProducer;
  let cacheService: MockCacheService;

  beforeEach(() => {
    repository = new MockClienteRepository();
    messageProducer = new MockMessageProducer();
    cacheService = new MockCacheService();
    useCase = new CriarClienteUseCase(
      repository,
      messageProducer,
      cacheService
    );
  });

  it("deve criar um cliente com dados válidos", async () => {
    const input = {
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
    };

    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("deve publicar evento CLIENTE_CRIADO ao criar cliente", async () => {
    const input = {
      nome: "Maria Silva",
      email: "maria@example.com",
      telefone: "(11) 91234-5678",
    };

    await useCase.execute(input);

    const messages = messageProducer.getMessages("cliente.criado");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      eventType: "CLIENTE_CRIADO",
      data: {
        nome: input.nome,
        email: input.email,
        telefone: input.telefone,
      },
    });
  });

  it("deve lançar ConflictError se email já existe", async () => {
    const input = {
      nome: "Pedro Santos",
      email: "pedro@example.com",
      telefone: "(21) 98765-4321",
    };

    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toThrow(ConflictError);
  });

  it("deve lançar ValidationError com nome inválido", async () => {
    const input = {
      nome: "",
      email: "test@example.com",
      telefone: "(11) 98765-4321",
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });

  it("deve lançar ValidationError com email inválido", async () => {
    const input = {
      nome: "Test User",
      email: "invalid-email",
      telefone: "(11) 98765-4321",
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });

  it("deve lançar ValidationError com telefone inválido", async () => {
    const input = {
      nome: "Test User",
      email: "test@example.com",
      telefone: "123",
    };

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });

  it("deve invalidar cache da lista ao criar novo cliente", async () => {
    const cachedData = {
      clientes: [
        {
          id: "old-id",
          nome: "Cliente Antigo",
          email: "old@example.com",
          telefone: "(11) 98765-4321",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    };

    await cacheService.set("clientes:list", cachedData, 300);

    const input = {
      nome: "Novo Cliente",
      email: "novo@example.com",
      telefone: "(11) 98765-4321",
    };

    await useCase.execute(input);

    const cached = await cacheService.get("clientes:list");
    expect(cached).toBeNull();
  });

  it("deve criar cliente mesmo se invalidação de cache falhar", async () => {
    const input = {
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
    };

    cacheService.delete = async () => {
      throw new Error("Cache service error");
    };

    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
    });
    expect(result.id).toBeDefined();
  });
});
