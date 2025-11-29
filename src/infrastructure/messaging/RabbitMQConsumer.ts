import amqp, { Channel, ConsumeMessage } from "amqplib";
import { IMessageConsumer } from "./interfaces/IMessageConsumer";
import { MessagingError } from "@shared/types/errors";

type RabbitMQConnection = Awaited<ReturnType<typeof amqp.connect>>;

export class RabbitMQConsumer implements IMessageConsumer {
  private connection: RabbitMQConnection | null = null;
  private channel: Channel | null = null;

  constructor(private readonly url: string = "amqp://localhost:5672") {}

  async connect(): Promise<void> {
    try {
      if (this.connection && this.channel) {
        console.log("RabbitMQ Consumer já está conectado");
        return;
      }

      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      await this.channel!.prefetch(1);

      console.log("RabbitMQ Consumer conectado");

      this.connection.on("error", (err: Error) => {
        console.error("Erro ao conectar ao RabbitMQ Consumer:", err);
      });

      this.connection.on("close", () => {
        console.log("Conexão do RabbitMQ Consumer fechada");
      });
    } catch (error) {
      throw new MessagingError("Erro ao conectar ao RabbitMQ Consumer", error);
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

      console.log("RabbitMQ Consumer desconectado");
    } catch (error) {
      throw new MessagingError(
        "Erro ao desconectar do RabbitMQ Consumer",
        error
      );
    }
  }

  private ensureConnected(): void {
    if (!this.channel) {
      throw new MessagingError(
        "RabbitMQ Consumer não está conectado. Execute connect() primeiro."
      );
    }
  }

  async consume(
    queue: string,
    handler: (message: unknown) => Promise<void>
  ): Promise<void> {
    try {
      this.ensureConnected();

      await this.channel!.assertQueue(queue, {
        durable: true,
      });

      console.log(`Aguardando mensagens na fila '${queue}'...`);

      await this.channel!.consume(
        queue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          try {
            const content = msg.content.toString();
            const message = JSON.parse(content);

            console.log(`Mensagem recebida da fila '${queue}':`, message);

            await handler(message);

            this.channel!.ack(msg);
            console.log(`Mensagem processada com sucesso`);
          } catch (error) {
            console.error("Erro ao processar mensagem:", error);

            this.channel!.nack(msg, false, false);
          }
        },
        {
          noAck: false,
        }
      );
    } catch (error) {
      throw new MessagingError(
        `Erro ao consumir mensagens da fila ${queue}`,
        error
      );
    }
  }
}
