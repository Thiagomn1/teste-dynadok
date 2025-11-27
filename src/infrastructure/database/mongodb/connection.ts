import { MongoClient, Db } from "mongodb";
import { DatabaseError } from "../../../shared/types/errors";

export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private client: MongoClient | null = null;
  private database: Db | null = null;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(uri: string, databaseName: string): Promise<void> {
    try {
      if (this.client && this.database) {
        console.log("MongoDB já está conectado");
        return;
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.database = this.client.db(databaseName);

      console.log(`Conectado ao MongoDB: ${databaseName}`);

      await this.database.admin().ping();
      console.log("MongoDB ping successful");
    } catch (error) {
      throw new DatabaseError("Erro ao conectar ao MongoDB", error);
    }
  }

  public getDatabase(): Db {
    if (!this.database) {
      throw new DatabaseError(
        "Database não inicializado. Execute connect() primeiro."
      );
    }
    return this.database;
  }

  public getClient(): MongoClient {
    if (!this.client) {
      throw new DatabaseError(
        "Cliente MongoDB não inicializado. Execute connect() primeiro."
      );
    }
    return this.client;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.database = null;
        console.log("Desconectado do MongoDB");
      }
    } catch (error) {
      throw new DatabaseError("Erro ao desconectar do MongoDB", error);
    }
  }

  public isConnected(): boolean {
    return this.client !== null && this.database !== null;
  }
}

export const getDatabase = (): Db => {
  return MongoDBConnection.getInstance().getDatabase();
};
