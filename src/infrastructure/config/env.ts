import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: true,
});

/**
 * Configurações da aplicação
 * Centraliza todas as variáveis de ambiente
 */
export const config = {
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
  },
  database: {
    mongoUri:
      process.env.MONGO_URI || "mongodb://localhost:27017/client-management",
  },
  cache: {
    redisHost: process.env.REDIS_HOST || "localhost",
    redisPort: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
  messaging: {
    rabbitmqUrl: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  },
} as const;
