export interface CreateClienteDTO {
  nome: string;
  email: string;
  telefone: string;
}

export interface UpdateClienteDTO {
  nome?: string;
  email?: string;
  telefone?: string;
}

export interface ClienteResponseDTO {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListClientesResponseDTO {
  clientes: ClienteResponseDTO[];
  total: number;
}
