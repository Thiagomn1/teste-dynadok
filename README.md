# Client Management API

Sistema de gerenciamento de clientes construído com **Clean Architecture**, **SOLID Principles** e **Event-Driven Architecture**.

## 🚀 Tecnologias

- **Runtime**: Node.js 20.x
- **Linguagem**: TypeScript 5.9
- **Framework Web**: Express 5.x
- **Banco de Dados**: MongoDB 7.0
- **Cache**: Redis 7.2
- **Message Broker**: RabbitMQ 3.13
- **Containerização**: Docker & Docker Compose
- **Testes**: Jest 30.x
- **Logs**: Winston 3.x

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** com separação clara de responsabilidades em camadas:

```
┌─────────────────────────────────────────┐
│           HTTP Layer (Interface)        │
│  Controllers, Routes, Middlewares       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Application Layer (Use Cases)    │
│  Business Logic, DTOs, Orchestration    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Domain Layer (Core)             │
│  Entities, Repository Interfaces        │
└─────────────────────────────────────────┘
               ▲
┌──────────────┴──────────────────────────┐
│      Infrastructure Layer               │
│  MongoDB, Redis, RabbitMQ, Config       │
└─────────────────────────────────────────┘
```

### Camadas

- **Domain**: Entidades de negócio (`Cliente`, `BaseEntity`) e interfaces de repositório
- **Application**: Use Cases que orquestram a lógica de negócio e DTOs
- **Infrastructure**: Implementações de banco de dados, cache, mensageria
- **HTTP**: Controllers, rotas Express e middlewares
- **Shared**: Utilitários, validadores, tipos compartilhados

## 🔧 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/client-management.git
cd client-management
```

### 2. Inicie todos os serviços com Docker

```bash
docker-compose up -d
```

**Pronto!** Isso irá:

1. Baixar as imagens Docker necessárias
2. Construir a aplicação Node.js
3. Iniciar todos os serviços:
   - **MongoDB** na porta `27017`
   - **Redis** na porta `6379`
   - **RabbitMQ** na porta `5672` (Management UI em `15672`)
   - **API** na porta `3000`

### 3. Verificar saúde da aplicação

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-29T...",
  "services": {
    "mongodb": "connected",
    "redis": "connected",
    "rabbitmq": "connected"
  }
}
```

## 💻 Desenvolvimento Local (sem Docker)

Se você preferir rodar a aplicação localmente sem Docker:

#### Pré-requisitos

- Node.js >= 20.x
- MongoDB >= 7.0 rodando localmente
- Redis >= 7.2 rodando localmente
- RabbitMQ >= 3.13 rodando localmente

#### Passos

1. **Instale as dependências:**

```bash
npm install
```

2. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações do seu ambiente local:

```env
# Application
NODE_ENV=development
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/client-management

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
```

3. **Inicie a aplicação em modo desenvolvimento:**

```bash
# Modo desenvolvimento (hot reload)
npm run dev
```

4. **Ou faça build e execute em modo produção:**

```bash
# Build para produção
npm run build

# Executar produção
npm start
```

### Acessar RabbitMQ Management UI

Abra [http://localhost:15672](http://localhost:15672) no navegador.

- **Usuário**: `admin`
- **Senha**: `admin123`

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

**Resposta:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-28T04:00:00.000Z",
  "services": {
    "mongodb": "connected",
    "redis": "connected",
    "rabbitmq": "connected"
  }
}
```

### Criar Cliente

```bash
POST /api/clientes
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "telefone": "(11) 98765-4321"
}
```

**Resposta (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "674a1b2c3d4e5f6a7b8c9d0e",
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "(11) 98765-4321",
    "createdAt": "2025-11-28T04:00:00.000Z",
    "updatedAt": "2025-11-28T04:00:00.000Z"
  }
}
```

### Listar Clientes

```bash
GET /api/clientes
```

**Resposta (200 OK):**

```json
{
  "success": true,
  "data": {
    "clientes": [
      {
        "id": "674a1b2c3d4e5f6a7b8c9d0e",
        "nome": "João Silva",
        "email": "joao@example.com",
        "telefone": "(11) 98765-4321",
        "createdAt": "2025-11-28T04:00:00.000Z",
        "updatedAt": "2025-11-28T04:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

**Cache**: Resultado armazenado em cache por 5 minutos.

### Buscar Cliente por ID

```bash
GET /api/clientes/{id}
```

**Resposta (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "674a1b2c3d4e5f6a7b8c9d0e",
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "(11) 98765-4321",
    "createdAt": "2025-11-28T04:00:00.000Z",
    "updatedAt": "2025-11-28T04:00:00.000Z"
  }
}
```

**Cache**: Cliente armazenado em cache por 5 minutos.

**Erro (404 Not Found):**

```json
{
  "success": false,
  "error": {
    "type": "NotFoundError",
    "message": "Cliente com identificador '123' não encontrado"
  }
}
```

### Atualizar Cliente

```bash
PUT /api/clientes/{id}
Content-Type: application/json

{
  "nome": "João Silva Santos",
  "telefone": "(11) 99999-9999"
}
```

**Resposta (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "674a1b2c3d4e5f6a7b8c9d0e",
    "nome": "João Silva Santos",
    "email": "joao@example.com",
    "telefone": "(11) 99999-9999",
    "createdAt": "2025-11-28T04:00:00.000Z",
    "updatedAt": "2025-11-28T04:05:00.000Z"
  }
}
```

**Validações**:

- Email deve ser único
- Telefone deve estar no formato brasileiro: `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`
- Nome não pode estar vazio

### Erros Comuns

**400 Bad Request** - Validação falhou:

```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Dados inválidos para criar cliente",
    "details": [
      "Email é obrigatório ou inválido",
      "Telefone é obrigatório ou inválido"
    ]
  }
}
```

**409 Conflict** - Email duplicado:

```json
{
  "success": false,
  "error": {
    "type": "ConflictError",
    "message": "Já existe um cliente com este email"
  }
}
```

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes com cobertura

```bash
npm run test:coverage
```

## 🎯 Princípios Aplicados

### Clean Architecture

- **Independência de Frameworks**: Regras de negócio não dependem de Express ou MongoDB
- **Testabilidade**: Lógica de negócio isolada e fácil de testar
- **Independência de UI**: HTTP é apenas uma interface, pode ser substituída
- **Independência de Database**: Repositórios abstraem persistência
- **Independência de Agentes Externos**: Cache e mensageria são plugáveis

### SOLID Principles

#### Single Responsibility Principle (SRP)

- Cada Use Case tem uma única responsabilidade
- `CriarClienteUseCase`: Apenas criar clientes
- `ClienteRepository`: Apenas persistir clientes

#### Open/Closed Principle (OCP)

- `BaseRepository<T>` é extensível sem modificação
- `ClienteRepository` estende funcionalidades sem alterar a base

#### Liskov Substitution Principle (LSP)

- Qualquer `IClienteRepository` pode substituir `IBaseRepository<Cliente>`
- `RedisCacheService` pode substituir `ICacheService`

#### Interface Segregation Principle (ISP)

- Interfaces específicas: `IMessageProducer`, `IMessageConsumer`
- Clientes não dependem de métodos que não usam

#### Dependency Inversion Principle (DIP)

- Use Cases dependem de abstrações (`IClienteRepository`, `ICacheService`)
- Container injeta implementações concretas
- Exemplo: `CriarClienteUseCase` recebe `IClienteRepository`, não `ClienteRepository`

### Design Patterns

- **Repository Pattern**: Abstração de acesso a dados
- **Dependency Injection**: Container gerencia dependências
- **Singleton**: Conexões de banco, cache e mensageria
- **Factory**: Criação de entidades
- **Observer**: Event-driven com RabbitMQ
- **Cache-Aside**: Leitura com fallback para banco

### Tratamento de Erros

Erros customizados com códigos HTTP apropriados:

- `ValidationError` (400): Dados inválidos
- `NotFoundError` (404): Recurso não encontrado
- `ConflictError` (409): Email duplicado
- `UnauthorizedError` (401): Não autenticado
- `ForbiddenError` (403): Sem permissão
- `DatabaseError` (500): Erro de banco
- `ExternalServiceError` (503): Serviço indisponível

### Logs Estruturados

Winston configurado com:

- Timestamps formatados
- Níveis: error, warn, info, debug
- Metadata estruturada
- Stack traces em erros

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build TypeScript + resolver aliases
npm start            # Executar produção
npm test             # Executar testes
npm run test:watch   # Testes em watch mode
npm run test:coverage # Cobertura de testes
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas de lint
```
