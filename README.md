# Client Management API

Sistema de cadastro e consulta de clientes desenvolvido com Node.js, TypeScript e Express, seguindo os princípios de Clean Architecture e SOLID.

## Tecnologias

- **Node.js** 20.x
- **TypeScript** 5.x
- **Express** 5.x
- **MongoDB** 7.x - Banco de dados principal
- **Redis** 7.x - Cache
- **RabbitMQ** 3.13 - Message Broker

## Arquitetura

O projeto segue os princípios de **Clean Architecture**, organizando o código em camadas bem definidas:

```
src/
├── domain/              # Camada de Domínio (Entidades e Regras de Negócio)
│   ├── entities/        # Entidades do domínio
│   └── repositories/    # Interfaces de repositórios
├── application/         # Camada de Aplicação (Casos de Uso)
│   └── use-cases/       # Casos de uso da aplicação
├── infrastructure/      # Camada de Infraestrutura (Detalhes de Implementação)
│   ├── database/        # Configuração e implementações de banco de dados
│   ├── cache/           # Implementação de cache (Redis)
│   ├── messaging/       # Implementação de mensageria (RabbitMQ)
│   └── http/            # Camada HTTP (Controllers, Routes, Middlewares)
│       ├── controllers/
│       ├── middlewares/
│       └── routes/
└── shared/              # Código compartilhado
    ├── utils/           # Utilitários
    └── types/           # Tipos TypeScript compartilhados
```

## Entidades

### BaseEntity
Classe abstrata base que contém campos comuns a todas as entidades:
- `id`: Identificador único
- `createdAt`: Data de criação
- `updatedAt`: Data de última atualização

### Cliente
Entidade que representa um cliente:
- `nome`: Nome completo do cliente
- `email`: Email único do cliente
- `telefone`: Telefone de contato

## Repositórios

### IBaseRepository<T>
Interface genérica que define operações CRUD básicas:
- `create(entity: T): Promise<T>`
- `findById(id: string): Promise<T | null>`
- `findAll(): Promise<T[]>`
- `update(id: string, entity: Partial<T>): Promise<T | null>`
- `delete(id: string): Promise<boolean>`
- `exists(id: string): Promise<boolean>`

### IClienteRepository
Interface específica para repositório de clientes, estendendo IBaseRepository:
- `findByEmail(email: string): Promise<Cliente | null>`
- `findByNome(nome: string): Promise<Cliente[]>`
- `findByTelefone(telefone: string): Promise<Cliente | null>`

## Configuração do Ambiente

### Pré-requisitos
- Node.js 20.x ou superior
- Docker e Docker Compose
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd client-management
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### Executando com Docker

1. Subir os serviços (MongoDB, Redis e RabbitMQ):
```bash
docker-compose up -d
```

2. Verificar status dos serviços:
```bash
docker-compose ps
```

3. Parar os serviços:
```bash
docker-compose down
```

### Desenvolvimento Local

1. Certifique-se de que os serviços estão rodando:
```bash
docker-compose up -d mongodb redis rabbitmq
```

2. Execute a aplicação em modo de desenvolvimento:
```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia a aplicação em modo de desenvolvimento com hot-reload
- `npm run build` - Compila o projeto TypeScript para JavaScript
- `npm start` - Inicia a aplicação em modo produção
- `npm run lint` - Executa o ESLint para verificar problemas no código
- `npm run lint:fix` - Executa o ESLint e corrige problemas automaticamente

## Acessando os Serviços

### RabbitMQ Management UI
- URL: http://localhost:15672
- Usuário: `admin`
- Senha: `admin123`

### MongoDB
- Host: `localhost`
- Port: `27017`
- Database: `client-management`

### Redis
- Host: `localhost`
- Port: `6379`

## Próximos Passos (Dias 2-4)

- [ ] **Dia 2**: Implementação da camada de infraestrutura
  - Repositórios MongoDB
  - Configuração de cache Redis
  - Setup de mensageria RabbitMQ

- [ ] **Dia 3**: Casos de uso e camada HTTP
  - Implementação dos use cases
  - Controllers e rotas
  - Middlewares de validação e erro

- [ ] **Dia 4**: Testes e refinamentos
  - Testes unitários e de integração
  - Documentação da API
  - Ajustes finais

## Princípios Aplicados

- **SOLID**
  - Single Responsibility Principle
  - Open/Closed Principle
  - Liskov Substitution Principle
  - Interface Segregation Principle
  - Dependency Inversion Principle

- **Clean Architecture**
  - Separação de responsabilidades em camadas
  - Independência de frameworks
  - Testabilidade
  - Independência de UI e banco de dados

## Licença

ISC
