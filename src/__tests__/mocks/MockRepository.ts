import { IBaseRepository } from "../../domain/repositories/IBaseRepository";
import { BaseEntity } from "../../domain/entities/BaseEntity";

export class MockRepository<T extends BaseEntity>
  implements IBaseRepository<T>
{
  private storage: Map<string, T> = new Map();

  async create(entity: T): Promise<T> {
    const id = entity.id || Math.random().toString(36).substring(7);
    const newEntity = { ...entity, id } as T;
    this.storage.set(id, newEntity);
    return newEntity;
  }

  async findById(id: string): Promise<T | null> {
    return this.storage.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.storage.values());
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = this.storage.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...data, id, updatedAt: new Date() } as T;
    this.storage.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.storage.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  clear(): void {
    this.storage.clear();
  }
}
