import { Db, WithId, Document } from "mongodb";
import { Cliente } from "../../../domain/entities/Cliente";
import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";
import { BaseRepository } from "./BaseRepository";
import { DatabaseError } from "../../../shared/types/errors";

export class ClienteRepository
  extends BaseRepository<Cliente>
  implements IClienteRepository
{
  constructor(db: Db) {
    super(db, "clientes");
    this.createIndexes();
  }

  private async createIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ email: 1 }, { unique: true });
      await this.collection.createIndex({ telefone: 1 });
      await this.collection.createIndex({ nome: "text" });
    } catch (error) {
      console.error("Erro ao criar índices:", error);
    }
  }

  protected toEntity(doc: WithId<Document>): Cliente {
    const cliente = new Cliente(
      doc.nome as string,
      doc.email as string,
      doc.telefone as string,
      doc._id.toString()
    );

    cliente.createdAt = doc.createdAt as Date;
    cliente.updatedAt = doc.updatedAt as Date;

    return cliente;
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    try {
      const doc = await this.collection.findOne({ email });
      return doc ? this.toEntity(doc) : null;
    } catch (error) {
      throw new DatabaseError("Erro ao buscar cliente por email", error);
    }
  }

  async findByNome(nome: string): Promise<Cliente[]> {
    try {
      const docs = await this.collection
        .find({
          nome: { $regex: nome, $options: "i" },
        })
        .toArray();

      return docs.map((doc) => this.toEntity(doc));
    } catch (error) {
      throw new DatabaseError("Erro ao buscar clientes por nome", error);
    }
  }

  async findByTelefone(telefone: string): Promise<Cliente | null> {
    try {
      const doc = await this.collection.findOne({ telefone });
      return doc ? this.toEntity(doc) : null;
    } catch (error) {
      throw new DatabaseError("Erro ao buscar cliente por telefone", error);
    }
  }
}
