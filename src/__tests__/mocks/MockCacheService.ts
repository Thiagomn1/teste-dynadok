import { ICacheService } from "../../infrastructure/cache/interfaces/ICacheService";

export class MockCacheService implements ICacheService {
  private storage: Map<string, any> = new Map();

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {}

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key) || null;
  }

  async set<T>(key: string, value: T, _ttl?: number): Promise<void> {
    this.storage.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async invalidate(_pattern: string): Promise<void> {
    this.storage.clear();
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  getStorage(): Map<string, any> {
    return this.storage;
  }
}
