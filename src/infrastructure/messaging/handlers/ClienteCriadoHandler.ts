import { ClienteCriadoEvent } from "@shared/types/events";

export class ClienteCriadoHandler {
  async handle(event: ClienteCriadoEvent): Promise<void> {
    try {
      console.log("Processando evento CLIENTE_CRIADO");
      console.log("Timestamp:", event.timestamp);
      console.log("Cliente ID:", event.data.id);
      console.log("Nome:", event.data.nome);
      console.log("Email:", event.data.email);
      console.log("Telefone:", event.data.telefone);

      await this.enviarEmailBoasVindas(event.data.email, event.data.nome);
      await this.registrarAnalytics(event.data.id);

      console.log("=== Evento processado com sucesso ===\n");
    } catch (error) {
      console.error("Erro ao processar evento CLIENTE_CRIADO:", error);
      throw error;
    }
  }

  private async enviarEmailBoasVindas(
    email: string,
    nome: string
  ): Promise<void> {
    console.log(`[EMAIL] Enviando email de boas-vindas para ${email}...`);
    console.log(`[EMAIL] Olá ${nome}, seja bem-vindo!`);
  }

  private async registrarAnalytics(clienteId: string): Promise<void> {
    console.log(`[ANALYTICS] Registrando novo cliente: ${clienteId}`);
  }
}
