import { ClienteAtualizadoEvent } from "@shared/types/events";

export class ClienteAtualizadoHandler {
  async handle(event: ClienteAtualizadoEvent): Promise<void> {
    try {
      console.log("=== Processando evento CLIENTE_ATUALIZADO ===");
      console.log("Timestamp:", event.timestamp);
      console.log("Cliente ID:", event.data.id);

      if (event.data.nome) {
        console.log("Nome atualizado para:", event.data.nome);
      }

      if (event.data.email) {
        console.log("Email atualizado para:", event.data.email);
        await this.notificarMudancaEmail(event.data.id, event.data.email);
      }

      if (event.data.telefone) {
        console.log("Telefone atualizado para:", event.data.telefone);
      }

      await this.atualizarAnalytics(event.data.id);

      console.log("=== Evento processado com sucesso ===\n");
    } catch (error) {
      console.error("Erro ao processar evento CLIENTE_ATUALIZADO:", error);
      throw error;
    }
  }

  private async notificarMudancaEmail(
    clienteId: string,
    novoEmail: string
  ): Promise<void> {
    console.log(
      `[EMAIL] Notificando mudança de email para cliente ${clienteId}`
    );
    console.log(`[EMAIL] Novo email: ${novoEmail}`);
    console.log("[EMAIL] Email de confirmação enviado");
  }

  private async atualizarAnalytics(clienteId: string): Promise<void> {
    console.log(`[ANALYTICS] Registrando atualização do cliente: ${clienteId}`);
  }
}
