/**
 * ICacheService
 *
 * Interface que define o contrato para serviços de cache
 */
export interface ICacheService {
  /**
   * Obtém um valor do cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Define um valor no cache
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Remove um valor do cache
   */
  delete(key: string): Promise<void>;

  /**
   * Remove múltiplos valores do cache por padrão
   */
  invalidate(pattern: string): Promise<void>;

  /**
   * Verifica se uma chave existe no cache
   */
  exists(key: string): Promise<boolean>;

  /**
   * Limpa todo o cache
   */
  clear(): Promise<void>;

  /**
   * Conecta ao serviço de cache
   */
  connect(): Promise<void>;

  /**
   * Desconecta do serviço de cache
   */
  disconnect(): Promise<void>;
}
