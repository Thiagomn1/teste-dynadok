import { Db } from "mongodb";
import { createClient, RedisClientType } from "redis";
import { MongoDBConnection } from "@infrastructure/database/mongodb/connection";
import { ClienteRepository } from "@infrastructure/database/mongodb/ClienteRepository";
import { RedisCacheService } from "@infrastructure/cache/RedisCacheService";
import { RabbitMQProducer } from "@infrastructure/messaging/RabbitMQProducer";
import { RabbitMQConsumer } from "@infrastructure/messaging/RabbitMQConsumer";
import { CriarClienteUseCase } from "@application/use-cases/cliente/CriarClienteUseCase";
import { BuscarClientePorIdUseCase } from "@application/use-cases/cliente/BuscarClientePorIdUseCase";
import { ListarClientesUseCase } from "@application/use-cases/cliente/ListarClientesUseCase";
import { AtualizarClienteUseCase } from "@application/use-cases/cliente/AtualizarClienteUseCase";
import { ClienteController } from "@http/controllers/ClienteController";
import { config } from "@infrastructure/config/env";
import { logger } from "@shared/utils/logger";

export class Container {
  private static instance: Container;

  private mongoConnection!: MongoDBConnection;
  private db!: Db;
  private redisClient!: RedisClientType;
  private cacheService!: RedisCacheService;
  private messageProducer!: RabbitMQProducer;
  private messageConsumer!: RabbitMQConsumer;

  private clienteRepository!: ClienteRepository;

  private criarClienteUseCase!: CriarClienteUseCase;
  private buscarClientePorIdUseCase!: BuscarClientePorIdUseCase;
  private listarClientesUseCase!: ListarClientesUseCase;
  private atualizarClienteUseCase!: AtualizarClienteUseCase;

  public clienteController!: ClienteController;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async initialize(): Promise<void> {
    logger.info("Initializing container...");

    await this.initializeInfrastructure();
    this.initializeRepositories();
    this.initializeUseCases();
    this.initializeControllers();

    logger.info("Container initialized successfully");
  }

  private async initializeInfrastructure(): Promise<void> {
    this.mongoConnection = MongoDBConnection.getInstance();
    await this.mongoConnection.connect(
      config.database.mongoUri,
      "client-management"
    );
    this.db = this.mongoConnection.getDatabase();
    logger.info("MongoDB connected");

    this.redisClient = createClient({
      socket: {
        host: config.cache.redisHost,
        port: config.cache.redisPort,
      },
    });
    await this.redisClient.connect();
    this.cacheService = new RedisCacheService(
      config.cache.redisHost,
      config.cache.redisPort
    );
    await this.cacheService.connect();
    logger.info("Redis connected");

    this.messageProducer = new RabbitMQProducer(config.messaging.rabbitmqUrl);
    await this.messageProducer.connect();
    logger.info("RabbitMQ Producer connected");

    this.messageConsumer = new RabbitMQConsumer(config.messaging.rabbitmqUrl);
    await this.messageConsumer.connect();
    logger.info("RabbitMQ Consumer connected");
  }

  private initializeRepositories(): void {
    this.clienteRepository = new ClienteRepository(this.db);
  }

  private initializeUseCases(): void {
    this.criarClienteUseCase = new CriarClienteUseCase(
      this.clienteRepository,
      this.messageProducer,
      this.cacheService
    );

    this.buscarClientePorIdUseCase = new BuscarClientePorIdUseCase(
      this.clienteRepository,
      this.cacheService
    );

    this.listarClientesUseCase = new ListarClientesUseCase(
      this.clienteRepository,
      this.cacheService
    );

    this.atualizarClienteUseCase = new AtualizarClienteUseCase(
      this.clienteRepository,
      this.cacheService,
      this.messageProducer
    );
  }

  private initializeControllers(): void {
    this.clienteController = new ClienteController(
      this.criarClienteUseCase,
      this.buscarClientePorIdUseCase,
      this.listarClientesUseCase,
      this.atualizarClienteUseCase
    );
  }

  async shutdown(): Promise<void> {
    logger.info("Shutting down container...");

    await this.messageConsumer.disconnect();
    await this.messageProducer.disconnect();
    await this.cacheService.disconnect();
    await this.redisClient.quit();
    await this.mongoConnection.disconnect();

    logger.info("Container shut down successfully");
  }
}
