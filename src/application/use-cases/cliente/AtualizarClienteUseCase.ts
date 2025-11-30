import { IClienteRepository } from "@domain/repositories/IClienteRepository";
import { ICacheService } from "@infrastructure/cache/interfaces/ICacheService";
import { IMessageProducer } from "@infrastructure/messaging/interfaces/IMessageProducer";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "@shared/types/errors";
import { IUseCase } from "@application/use-cases/interfaces/IUseCase";
import {
  UpdateClienteDTO,
  ClienteResponseDTO,
} from "@application/dtos/ClienteDTO";
import { ClienteAtualizadoEvent, QueueNames } from "@shared/types/events";
import { Validators } from "@shared/utils/validators";
import { CacheKeys } from "@shared/constants/cache";

export interface AtualizarClienteInput extends UpdateClienteDTO {
  id: string;
}

export class AtualizarClienteUseCase
  implements IUseCase<AtualizarClienteInput, ClienteResponseDTO>
{

  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly cacheService: ICacheService,
    private readonly messageProducer: IMessageProducer
  ) {}

  async execute(input: AtualizarClienteInput): Promise<ClienteResponseDTO> {
    const clienteExistente = await this.clienteRepository.findById(input.id);
    if (!clienteExistente) {
      throw new NotFoundError("Cliente", input.id);
    }

    await this.validate(input);

    if (input.email && input.email !== clienteExistente.email) {
      const clienteComEmail = await this.clienteRepository.findByEmail(
        input.email
      );
      if (clienteComEmail) {
        throw new ConflictError("Já existe um cliente com este email");
      }
    }

    const updateData: Partial<{
      nome: string;
      email: string;
      telefone: string;
    }> = {};

    if (input.nome !== undefined) updateData.nome = input.nome;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.telefone !== undefined) updateData.telefone = input.telefone;

    const clienteAtualizado = await this.clienteRepository.update(
      input.id,
      updateData
    );

    if (!clienteAtualizado) {
      throw new NotFoundError("Cliente", input.id);
    }

    await this.invalidateCache(input.id);
    await this.publishClienteAtualizadoEvent(clienteAtualizado.id!, input);

    return {
      id: clienteAtualizado.id!,
      nome: clienteAtualizado.nome,
      email: clienteAtualizado.email,
      telefone: clienteAtualizado.telefone,
      createdAt: clienteAtualizado.createdAt,
      updatedAt: clienteAtualizado.updatedAt,
    };
  }

  private async validate(input: UpdateClienteDTO): Promise<void> {
    const errors: string[] = [];

    if (input.nome !== undefined && !Validators.isNotEmpty(input.nome)) {
      errors.push("Nome não pode ser vazio");
    }

    if (input.email !== undefined && !Validators.isValidEmail(input.email)) {
      errors.push("Email é inválido");
    }

    if (
      input.telefone !== undefined &&
      !Validators.isValidBrazilianPhone(input.telefone)
    ) {
      errors.push("Telefone é inválido");
    }

    if (errors.length > 0) {
      throw new ValidationError(
        "Dados inválidos para atualizar cliente",
        errors
      );
    }
  }

  private async invalidateCache(clienteId: string): Promise<void> {
    try {
      await this.cacheService.delete(CacheKeys.CLIENTE_BY_ID(clienteId));
      await this.cacheService.delete(CacheKeys.CLIENTE_LIST);
    } catch (error) {
      console.error("Erro ao invalidar cache:", error);
    }
  }

  private async publishClienteAtualizadoEvent(
    clienteId: string,
    updates: UpdateClienteDTO
  ): Promise<void> {
    try {
      const event: ClienteAtualizadoEvent = {
        eventType: "CLIENTE_ATUALIZADO",
        timestamp: new Date(),
        data: {
          id: clienteId,
          ...updates,
        },
      };

      await this.messageProducer.publish(QueueNames.CLIENTE_ATUALIZADO, event);
    } catch (error) {
      console.error("Erro ao publicar evento de cliente atualizado:", error);
    }
  }
}
