/**
 * IMessageProducer
 *
 * Interface que define o contrato para produtores de mensagens
 */
export interface IMessageProducer {
  /**
   * Conecta ao broker de mensagens
   */
  connect(): Promise<void>;

  /**
   * Desconecta do broker de mensagens
   */
  disconnect(): Promise<void>;

  /**
   * Publica uma mensagem em uma fila
   */
  publish(queue: string, message: unknown): Promise<void>;

  /**
   * Publica uma mensagem em um exchange
   */
  publishToExchange(exchange: string, routingKey: string, message: unknown): Promise<void>;
}
