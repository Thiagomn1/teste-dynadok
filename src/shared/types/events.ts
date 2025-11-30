export interface DomainEvent {
  eventType: string;
  timestamp: Date;
  data: unknown;
}

export interface ClienteCriadoEvent extends DomainEvent {
  eventType: "CLIENTE_CRIADO";
  data: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
  };
}

export interface ClienteAtualizadoEvent extends DomainEvent {
  eventType: "CLIENTE_ATUALIZADO";
  data: {
    id: string;
    nome?: string;
    email?: string;
    telefone?: string;
  };
}

export interface ClienteRemovidoEvent extends DomainEvent {
  eventType: "CLIENTE_REMOVIDO";
  data: {
    id: string;
  };
}

export const QueueNames = {
  CLIENTE_CRIADO: "cliente.criado",
  CLIENTE_ATUALIZADO: "cliente.atualizado",
  CLIENTE_REMOVIDO: "cliente.removido",
} as const;
