/**
 * IMessageConsumer
 *
 * Interface que define o contrato para consumidores de mensagens
 */
export interface IMessageConsumer {
  /**
   * Conecta ao broker de mensagens
   */
  connect(): Promise<void>;

  /**
   * Desconecta do broker de mensagens
   */
  disconnect(): Promise<void>;

  /**
   * Consome mensagens de uma fila
   */
  consume(queue: string, handler: (message: unknown) => Promise<void>): Promise<void>;
}
