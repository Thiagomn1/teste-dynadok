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
