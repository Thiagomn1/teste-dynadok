import { createClient, RedisClientType } from "redis";
import { ICacheService } from "./interfaces/ICacheService";
import { CacheError } from "@shared/types/errors";

export class RedisCacheService implements ICacheService {
  private client: RedisClientType | null = null;
  private readonly defaultTTL: number = 3600; // 1 hora em segundos

  constructor(
    private readonly host: string = "localhost",
    private readonly port: number = 6379
  ) {}

  async connect(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        console.log("Redis já está conectado");
        return;
      }

      this.client = createClient({
        socket: {
          host: this.host,
          port: this.port,
        },
      });

      this.client.on("error", (err) => {
        console.error("Erro no cliente Redis:", err);
      });

      this.client.on("connect", () => {
        console.log("Conectando ao Redis...");
      });

      this.client.on("ready", () => {
        console.log("Redis conectado e pronto");
      });

      await this.client.connect();
    } catch (error) {
      throw new CacheError("Erro ao conectar ao Redis", error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        await this.client.quit();
        this.client = null;
        console.log("Desconectado do Redis");
      }
    } catch (error) {
      throw new CacheError("Erro ao desconectar do Redis", error);
    }
  }

  private ensureConnected(): void {
    if (!this.client?.isOpen) {
      throw new CacheError(
        "Redis não está conectado. Execute connect() primeiro."
      );
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      this.ensureConnected();
      const value = await this.client!.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      if (error instanceof CacheError) throw error;
      throw new CacheError(`Erro ao obter valor do cache: ${key}`, error);
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      this.ensureConnected();
      const serialized = JSON.stringify(value);
      await this.client!.setEx(key, ttl, serialized);
    } catch (error) {
      throw new CacheError(`Erro ao definir valor no cache: ${key}`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.ensureConnected();
      await this.client!.del(key);
    } catch (error) {
      throw new CacheError(`Erro ao deletar valor do cache: ${key}`, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      this.ensureConnected();
      const keys = await this.client!.keys(pattern);

      if (keys.length > 0) {
        await this.client!.del(keys);
      }
    } catch (error) {
      throw new CacheError(
        `Erro ao invalidar cache com padrão: ${pattern}`,
        error
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      this.ensureConnected();
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      throw new CacheError(
        `Erro ao verificar existência da chave: ${key}`,
        error
      );
    }
  }

  async clear(): Promise<void> {
    try {
      this.ensureConnected();
      await this.client!.flushDb();
    } catch (error) {
      throw new CacheError("Erro ao limpar cache", error);
    }
  }
}
