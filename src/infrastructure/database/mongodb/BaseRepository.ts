import {
  Collection,
  Db,
  ObjectId,
  OptionalId,
  WithId,
  Document,
} from "mongodb";
import { BaseEntity } from "@domain/entities/BaseEntity";
import { IBaseRepository } from "@domain/repositories/IBaseRepository";
import { DatabaseError } from "@shared/types/errors";

export abstract class BaseRepository<T extends BaseEntity>
  implements IBaseRepository<T>
{
  protected collection: Collection;

  constructor(
    protected readonly db: Db,
    protected readonly collectionName: string
  ) {
    this.collection = db.collection(collectionName);
  }

  protected abstract toEntity(doc: WithId<Document>): T;

  protected toDocument(entity: T): OptionalId<Document> {
    const doc: Record<string, unknown> = {
      nome: (entity as any).nome,
      email: (entity as any).email,
      telefone: (entity as any).telefone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    if (entity.id) {
      doc._id = new ObjectId(entity.id);
    }

    return doc as OptionalId<Document>;
  }

  async create(entity: T): Promise<T> {
    try {
      const doc = this.toDocument(entity);
      const result = await this.collection.insertOne(doc);

      const inserted = await this.collection.findOne({
        _id: result.insertedId,
      });
      if (!inserted) {
        throw new DatabaseError("Erro ao recuperar entidade criada");
      }

      return this.toEntity(inserted);
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(
        "Erro ao criar entidade no banco de dados",
        error
      );
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      return doc ? this.toEntity(doc) : null;
    } catch (error) {
      throw new DatabaseError("Erro ao buscar entidade por ID", error);
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const docs = await this.collection.find({}).toArray();
      return docs.map((doc) => this.toEntity(doc));
    } catch (error) {
      throw new DatabaseError("Erro ao buscar todas as entidades", error);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      Object.keys(data).forEach((key) => {
        if (
          key !== "id" &&
          key !== "createdAt" &&
          data[key as keyof T] !== undefined
        ) {
          updateData[key] = data[key as keyof T];
        }
      });

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      return result ? this.toEntity(result) : null;
    } catch (error) {
      throw new DatabaseError("Erro ao atualizar entidade", error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      throw new DatabaseError("Erro ao deletar entidade", error);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(id)) {
        return false;
      }

      const count = await this.collection.countDocuments({
        _id: new ObjectId(id),
      });
      return count > 0;
    } catch (error) {
      throw new DatabaseError(
        "Erro ao verificar existência da entidade",
        error
      );
    }
  }
}
