import { describe, it, expect, beforeEach } from "@jest/globals";
import { MockRepository } from "../../mocks/MockRepository";
import { BaseEntity } from "../../../domain/entities/BaseEntity";

class MockEntity extends BaseEntity {
  constructor(
    public name: string,
    public value: number,
    id?: string
  ) {
    super(id);
  }
}

describe("BaseRepository", () => {
  let repository: MockRepository<MockEntity>;

  beforeEach(() => {
    repository = new MockRepository<MockEntity>();
    repository.clear();
  });

  it("deve criar uma entidade com sucesso", async () => {
    const entity = new MockEntity("Test", 100);
    const created = await repository.create(entity);

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Test");
    expect(created.value).toBe(100);
  });

  it("deve buscar entidade por ID", async () => {
    const entity = new MockEntity("Test", 100);
    const created = await repository.create(entity);

    const found = await repository.findById(created.id!);

    expect(found).not.toBeNull();
    expect(found?.name).toBe("Test");
  });

  it("deve retornar null ao buscar ID inexistente", async () => {
    const found = await repository.findById("id-inexistente");

    expect(found).toBeNull();
  });

  it("deve listar todas as entidades", async () => {
    await repository.create(new MockEntity("Test1", 100));
    await repository.create(new MockEntity("Test2", 200));
    await repository.create(new MockEntity("Test3", 300));

    const all = await repository.findAll();

    expect(all).toHaveLength(3);
  });

  it("deve atualizar uma entidade existente", async () => {
    const entity = new MockEntity("Original", 100);
    const created = await repository.create(entity);

    const updated = await repository.update(created.id!, {
      name: "Updated",
      value: 200,
    });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("Updated");
    expect(updated?.value).toBe(200);
  });

  it("deve retornar null ao atualizar ID inexistente", async () => {
    const updated = await repository.update("id-inexistente", {
      name: "Test",
    });

    expect(updated).toBeNull();
  });

  it("deve deletar uma entidade existente", async () => {
    const entity = new MockEntity("Test", 100);
    const created = await repository.create(entity);

    const deleted = await repository.delete(created.id!);

    expect(deleted).toBe(true);

    const found = await repository.findById(created.id!);
    expect(found).toBeNull();
  });

  it("deve retornar false ao deletar ID inexistente", async () => {
    const deleted = await repository.delete("id-inexistente");

    expect(deleted).toBe(false);
  });

  it("deve verificar se entidade existe", async () => {
    const entity = new MockEntity("Test", 100);
    const created = await repository.create(entity);

    const exists = await repository.exists(created.id!);

    expect(exists).toBe(true);
  });

  it("deve retornar false para entidade inexistente", async () => {
    const exists = await repository.exists("id-inexistente");

    expect(exists).toBe(false);
  });
});
