import { describe, it, expect, beforeEach } from "@jest/globals";
import { AtualizarClienteUseCase } from "../../../application/use-cases/cliente/AtualizarClienteUseCase";
import { Cliente } from "../../../domain/entities/Cliente";
import { MockRepository } from "../../mocks/MockRepository";
import { MockCacheService } from "../../mocks/MockCacheService";
import { MockMessageProducer } from "../../mocks/MockMessageProducer";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../../shared/types/errors";
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

describe("AtualizarClienteUseCase", () => {
  let useCase: AtualizarClienteUseCase;
  let repository: MockClienteRepository;
  let cacheService: MockCacheService;
  let messageProducer: MockMessageProducer;

  beforeEach(() => {
    repository = new MockClienteRepository();
    cacheService = new MockCacheService();
    messageProducer = new MockMessageProducer();
    useCase = new AtualizarClienteUseCase(
      repository,
      cacheService,
      messageProducer
    );
  });

  it("deve atualizar um cliente existente", async () => {
    const cliente = new Cliente(
      "João Silva",
      "joao@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    const result = await useCase.execute({
      id: created.id!,
      nome: "João Silva Santos",
      email: "joao@example.com",
      telefone: "(11) 91234-5678",
    });

    expect(result.nome).toBe("João Silva Santos");
    expect(result.telefone).toBe("(11) 91234-5678");
    expect(result.email).toBe("joao@example.com");
  });

  it("deve invalidar cache após atualizar", async () => {
    const cliente = new Cliente(
      "Maria Silva",
      "maria@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    await cacheService.set(`cliente:${created.id}`, created);
    expect(await cacheService.exists(`cliente:${created.id}`)).toBe(true);

    await useCase.execute({
      id: created.id!,
      nome: "Maria Santos",
    });

    expect(await cacheService.exists(`cliente:${created.id}`)).toBe(false);
  });

  it("deve publicar evento CLIENTE_ATUALIZADO", async () => {
    const cliente = new Cliente(
      "Pedro Santos",
      "pedro@example.com",
      "(21) 98765-4321"
    );
    const created = await repository.create(cliente);

    await useCase.execute({
      id: created.id!,
      nome: "Pedro Santos Silva",
    });

    const messages = messageProducer.getMessages("cliente.atualizado");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      eventType: "CLIENTE_ATUALIZADO",
      data: {
        id: created.id,
        nome: "Pedro Santos Silva",
      },
    });
  });

  it("deve lançar NotFoundError se cliente não existe", async () => {
    await expect(
      useCase.execute({
        id: "id-inexistente",
        nome: "Test",
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("deve lançar ConflictError ao tentar usar email já existente", async () => {
    const cliente1 = new Cliente(
      "Cliente 1",
      "email1@example.com",
      "(11) 98765-4321"
    );
    await repository.create(cliente1);

    const cliente2 = new Cliente(
      "Cliente 2",
      "email2@example.com",
      "(11) 91234-5678"
    );
    const created2 = await repository.create(cliente2);

    await expect(
      useCase.execute({
        id: created2.id!,
        email: "email1@example.com",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("deve permitir atualizar mantendo o mesmo email", async () => {
    const cliente = new Cliente(
      "João Silva",
      "joao@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    const result = await useCase.execute({
      id: created.id!,
      nome: "João Santos",
      email: "joao@example.com",
    });

    expect(result.nome).toBe("João Santos");
    expect(result.email).toBe("joao@example.com");
  });

  it("deve invalidar cache da lista ao atualizar cliente", async () => {
    const cliente = new Cliente(
      "João Silva",
      "joao@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    const cachedData = {
      clientes: [
        {
          id: created.id,
          nome: "João Silva",
          email: "joao@example.com",
          telefone: "(11) 98765-4321",
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      ],
      total: 1,
    };

    await cacheService.set("clientes:list", cachedData, 300);

    await useCase.execute({
      id: created.id!,
      nome: "João Santos",
    });

    const cached = await cacheService.get("clientes:list");
    expect(cached).toBeNull();
  });

  it("deve invalidar tanto cache individual quanto cache da lista", async () => {
    const cliente = new Cliente(
      "Ana Silva",
      "ana@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    await cacheService.set(`cliente:${created.id}`, created, 300);
    await cacheService.set(
      "clientes:list",
      { clientes: [created], total: 1 },
      300
    );

    expect(await cacheService.exists(`cliente:${created.id}`)).toBe(true);
    expect(await cacheService.exists("clientes:list")).toBe(true);

    await useCase.execute({
      id: created.id!,
      nome: "Ana Santos",
    });

    expect(await cacheService.exists(`cliente:${created.id}`)).toBe(false);
    expect(await cacheService.exists("clientes:list")).toBe(false);
  });

  it("deve lançar ValidationError ao tentar atualizar com nome vazio", async () => {
    const cliente = new Cliente(
      "João Silva",
      "joao@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    await expect(
      useCase.execute({
        id: created.id!,
        nome: "",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("deve lançar ValidationError ao tentar atualizar com email inválido", async () => {
    const cliente = new Cliente(
      "Maria Silva",
      "maria@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    await expect(
      useCase.execute({
        id: created.id!,
        email: "email-invalido",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("deve lançar ValidationError ao tentar atualizar com telefone inválido", async () => {
    const cliente = new Cliente(
      "Pedro Santos",
      "pedro@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    await expect(
      useCase.execute({
        id: created.id!,
        telefone: "123",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("deve permitir atualizar sem validar campos não fornecidos", async () => {
    const cliente = new Cliente(
      "Carlos Silva",
      "carlos@example.com",
      "(11) 98765-4321"
    );
    const created = await repository.create(cliente);

    const result = await useCase.execute({
      id: created.id!,
      nome: "Carlos Santos",
    });

    expect(result.nome).toBe("Carlos Santos");
    expect(result.email).toBe("carlos@example.com");
    expect(result.telefone).toBe("(11) 98765-4321");
  });
});
