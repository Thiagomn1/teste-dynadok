import amqp, { Channel } from "amqplib";
import { IMessageProducer } from "./interfaces/IMessageProducer";
import { MessagingError } from "@shared/types/errors";

type RabbitMQConnection = Awaited<ReturnType<typeof amqp.connect>>;

export class RabbitMQProducer implements IMessageProducer {
  private connection: RabbitMQConnection | null = null;
  private channel: Channel | null = null;

  constructor(private readonly url: string = "amqp://localhost:5672") {}

  async connect(): Promise<void> {
    try {
      if (this.connection && this.channel) {
        console.log("RabbitMQ Producer já está conectado");
        return;
      }

      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      console.log("RabbitMQ Producer conectado");

      this.connection.on("error", (err: Error) => {
        console.error("RabbitMQ Connection Error:", err);
      });

      this.connection.on("close", () => {
        console.log("RabbitMQ Connection closed");
      });
    } catch (error) {
      throw new MessagingError("Erro ao conectar ao RabbitMQ Producer", error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      console.log("RabbitMQ Producer desconectado");
    } catch (error) {
      throw new MessagingError(
        "Erro ao desconectar do RabbitMQ Producer",
        error
      );
    }
  }

  private ensureConnected(): void {
    if (!this.channel) {
      throw new MessagingError(
        "RabbitMQ Producer não está conectado. Execute connect() primeiro."
      );
    }
  }

  async publish(queue: string, message: unknown): Promise<void> {
    try {
      this.ensureConnected();

      await this.channel!.assertQueue(queue, {
        durable: true,
      });

      const messageBuffer = Buffer.from(JSON.stringify(message));

      this.channel!.sendToQueue(queue, messageBuffer, {
        persistent: true,
      });

      console.log(`Mensagem publicada na fila '${queue}':`, message);
    } catch (error) {
      throw new MessagingError(
        `Erro ao publicar mensagem na fila ${queue}`,
        error
      );
    }
  }

  async publishToExchange(
    exchange: string,
    routingKey: string,
    message: unknown
  ): Promise<void> {
    try {
      this.ensureConnected();

      await this.channel!.assertExchange(exchange, "topic", {
        durable: true,
      });

      const messageBuffer = Buffer.from(JSON.stringify(message));

      this.channel!.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
      });

      console.log(
        `Mensagem publicada no exchange '${exchange}' com routing key '${routingKey}':`,
        message
      );
    } catch (error) {
      throw new MessagingError(
        `Erro ao publicar mensagem no exchange ${exchange}`,
        error
      );
    }
  }
}
