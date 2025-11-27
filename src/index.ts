import express from "express";
import { config } from "./infrastructure/config/env";
import { Container } from "./infrastructure/container";
import { createRoutes } from "./http/routes";
import { requestLogger } from "./http/middlewares/requestLogger";
import { errorHandler } from "./http/middlewares/errorHandler";
import { HealthController } from "./http/controllers/HealthController";
import { logger } from "./shared/utils/logger";

async function bootstrap() {
  try {
    const app = express();

    app.use(express.json());
    app.use(requestLogger);

    const healthController = new HealthController();
    app.get("/", (_req, res) => {
      res.json({
        success: true,
        message: "Client Management API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      });
    });

    app.get("/health", (req, res) => healthController.check(req, res));

    const container = Container.getInstance();
    await container.initialize();

    const routes = createRoutes(container.clienteController);
    app.use("/api", routes);

    app.use(errorHandler);

    const port = config.app.port;

    const server = app.listen(port, () => {
      logger.info(`Servidor rodando na porta ${port}`);
      logger.info(`http://localhost:${port}`);
    });

    const gracefulShutdown = async () => {
      logger.info("Sinal de encerramento recebido");

      server.close(async () => {
        logger.info("Servidor HTTP fechado");
        await container.shutdown();
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forçando encerramento após timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    logger.error("Falha ao iniciar a aplicação", { error });
    process.exit(1);
  }
}

bootstrap();
