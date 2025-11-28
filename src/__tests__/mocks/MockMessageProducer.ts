import { IMessageProducer } from "../../infrastructure/messaging/interfaces/IMessageProducer";

export class MockMessageProducer implements IMessageProducer {
  public messages: Array<{ queue: string; message: unknown }> = [];

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {}

  async publish(queue: string, message: unknown): Promise<void> {
    this.messages.push({ queue, message });
  }

  async publishToExchange(
    _exchange: string,
    _routingKey: string,
    _message: unknown
  ): Promise<void> {}

  clear(): void {
    this.messages = [];
  }

  getMessages(queue?: string): unknown[] {
    if (queue) {
      return this.messages
        .filter((m) => m.queue === queue)
        .map((m) => m.message);
    }
    return this.messages.map((m) => m.message);
  }
}
