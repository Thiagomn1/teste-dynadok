import { Cliente } from "../../../domain/entities/Cliente";
import { IClienteRepository } from "../../../domain/repositories/IClienteRepository";
import { IMessageProducer } from "../../../infrastructure/messaging/interfaces/IMessageProducer";
import { ConflictError, ValidationError } from "../../../shared/types/errors";
import { ClienteCriadoEvent, QueueNames } from "../../../shared/types/events";
import { Validators } from "../../../shared/utils/validators";
import { IUseCase } from "../interfaces/IUseCase";

export interface CriarClienteInput {
  nome: string;
  email: string;
  telefone: string;
}

export interface CriarClienteOutput {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CriarClienteUseCase
  implements IUseCase<CriarClienteInput, CriarClienteOutput>
{
  constructor(
    private readonly clienteRepository: IClienteRepository,
    private readonly messageProducer: IMessageProducer
  ) {}

  async execute(input: CriarClienteInput): Promise<CriarClienteOutput> {
    await this.validate(input);

    const clienteExistente = await this.clienteRepository.findByEmail(
      input.email
    );
    if (clienteExistente) {
      throw new ConflictError("Já existe um cliente com este email");
    }

    const cliente = new Cliente(input.nome, input.email, input.telefone);

    const clienteCriado = await this.clienteRepository.create(cliente);

    await this.publishClienteCriadoEvent(clienteCriado);

    return {
      id: clienteCriado.id!,
      nome: clienteCriado.nome,
      email: clienteCriado.email,
      telefone: clienteCriado.telefone,
      createdAt: clienteCriado.createdAt,
      updatedAt: clienteCriado.updatedAt,
    };
  }

  private async validate(input: CriarClienteInput): Promise<void> {
    const errors: string[] = [];

    if (!Validators.isNotEmpty(input.nome)) {
      errors.push("Nome é obrigatório");
    }

    if (!Validators.isValidEmail(input.email)) {
      errors.push("Email é obrigatório ou inválido");
    }

    if (!Validators.isValidBrazilianPhone(input.telefone)) {
      errors.push("Telefone é obrigatório ou inválido");
    }

    if (errors.length > 0) {
      throw new ValidationError("Dados inválidos para criar cliente", errors);
    }
  }

  private async publishClienteCriadoEvent(cliente: Cliente): Promise<void> {
    try {
      const event: ClienteCriadoEvent = {
        eventType: "CLIENTE_CRIADO",
        timestamp: new Date(),
        data: {
          id: cliente.id!,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
        },
      };

      await this.messageProducer.publish(QueueNames.CLIENTE_CRIADO, event);
    } catch (error) {
      console.error("Erro ao publicar evento de cliente criado:", error);
    }
  }
}
