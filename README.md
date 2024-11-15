<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Running docker services

```bash
# Start services
$ npm run docker:up

# Stop services
$ npm run docker:down

# Restart services
$ npm run docker:restart
```

# Proyecto de Productor y Consumidor de Mensajes

Este es un proyecto unificado que incluye un sistema de productor y consumidor de mensajes, con soporte para varios transportes de mensajes como RabbitMQ y Kafka. Está construido en NestJS y puede expandirse fácilmente para incluir otros sistemas de transporte de mensajes.

## Estructura del Proyecto

```plaintext
src
├── app.module.ts                       # Módulo raíz de la aplicación
├── messaging                           # Configuración y servicios de mensajería
│   ├── messaging-connection.config.ts  # Configuración de transporte (RabbitMQ, Kafka, etc.)
│   ├── messaging.module.ts             # Módulo de mensajería
│   └── messaging-rabbitmq-setup.service.ts # Configuración específica de RabbitMQ (DLX y DLQ)
├── dtos
│   └── order.dto.ts                    # DTO compartido para las órdenes
├── main.ts                             # Archivo principal para iniciar la aplicación
├── producer                            # Módulo del Productor
│   ├── producer.module.ts              # Configuración del módulo del productor
│   ├── producer.service.ts             # Lógica del productor para enviar mensajes
│   └── producer.controller.ts          # Controlador HTTP del productor
└── consumer                            # Módulo del Consumidor
    ├── consumer.module.ts              # Configuración del módulo del consumidor
    ├── consumer.service.ts             # Lógica del consumidor para procesar mensajes
    ├── consumer.controller.ts          # Controlador principal del consumidor
    └── dead-letter
        └── dead-letter.controller.ts   # Controlador para manejar mensajes muertos (DLQ)
```
## Estructura del Docker
```
version: '3.8'  # Specify the Docker Compose version

services:
  # RabbitMQ service with management plugin
  rabbitmq:
    image: <rabbitmq-image>  # Include the management plugin
    container_name: <rabbitmq-container-name>
    hostname: <rabbitmq-hostname>
    ports:
      - "${RABBITMQ_PORT}:<amqp-port>"  # AMQP standard port
      - "${RABBITMQ_PORT_ADMIN}:<admin-port>"  # Management interface port
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_DEFAULT_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_DEFAULT_PASS}
    networks:
      - app-network

  # Zookeeper service (required for Kafka)
  zookeeper:
    image: <zookeeper-image>
    container_name: <zookeeper-container-name>
    hostname: <zookeeper-hostname>
    environment:
      ZOOKEEPER_CLIENT_PORT: <client-port>
      ZOOKEEPER_TICK_TIME: <tick-time>
      ZOOKEEPER_SYNC_LIMIT: <sync-limit>
    ports:
      - "<client-port>:<client-port>"
    volumes:
      - zookeeper_data:/var/lib/zookeeper
    networks:
      - app-network

  # Kafka Broker service
  kafka:
    image: <kafka-image>
    container_name: <kafka-container-name>
    hostname: <kafka-hostname>
    depends_on:
      - zookeeper
    ports:
      - "<broker-port>:<broker-port>"
    environment:
      KAFKA_BROKER_ID: <broker-id>
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:<zookeeper-port>
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://<advertised-listener>
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: <replication-factor>
      KAFKA_CONSUMER_GROUP: ${KAFKA_CONSUMER_GROUP}
      KAFKA_CONSUMER_GROUP_DLQ: ${KAFKA_CONSUMER_GROUP_DLQ}
    volumes:
      - kafka_data:/var/lib/kafka/data
    networks:
      - app-network

volumes:
  rabbitmq_data:
    driver: local
  zookeeper_data:
    driver: local
  kafka_data:
    driver: local

networks:
  app-network:
    driver: bridge
```

## Descripción de Archivos y Módulos

### 1. `app.module.ts`

Este es el módulo raíz de la aplicación. Importa y configura tanto el módulo del productor (`ProducerModule`) como el del consumidor (`ConsumerModule`). También registra el módulo de configuración global (`ConfigModule`), permitiendo el acceso a las variables de entorno en todo el proyecto.

### 2. Configuración de Mensajería (`messaging`)

- **messaging-connection.config.ts**: Configura los tipos de transporte para RabbitMQ o Kafka. La función `getConnectionQueue` se usa para inicializar el microservicio del consumidor, y `getProducerClientOptions` se usa para configurar el cliente en el productor.
- **messaging.module.ts**: Define el módulo que agrupa todos los servicios y configuraciones de mensajería, incluyendo `RabbitMQSetupService` para la configuración de RabbitMQ.
- **messaging-rabbitmq-setup.service.ts**: Configura los recursos de RabbitMQ, como el `Dead Letter Exchange` (DLX) y la `Dead Letter Queue` (DLQ), asegurando que los mensajes fallidos se gestionen correctamente.

### 3. DTO (`dtos/order.dto.ts`)

Define `OrderDto`, el objeto de transferencia de datos (DTO) compartido entre productor y consumidor para representar una orden. Este DTO permite definir y validar la estructura de los datos de la orden.

### 4. Módulo del Productor (`producer`)

- **producer.module.ts**: Configura el módulo del productor, incluyendo `ClientsModule` para manejar la conexión de transporte y registrando `ProducerController`.
- **producer.service.ts**: Contiene la lógica del productor para enviar mensajes. Incluye métodos como `placeOrder`, que emite un evento `order-placed`, y `getOrders`, que envía una solicitud para obtener las órdenes existentes.
- **producer.controller.ts**: Expone los endpoints HTTP del productor:
    - `POST /orders/place-order`: Envía una nueva orden.
    - `GET /orders`: Solicita las órdenes actuales.

### 5. Módulo del Consumidor (`consumer`)

- **consumer.module.ts**: Configura el módulo del consumidor, registrando `ConsumerController`,`DeadLetterController` y los servicios necesarios para el procesamiento de mensajes.
- **consumer.service.ts**: Contiene la lógica para procesar los mensajes recibidos, almacenando y gestionando las órdenes. Implementa métodos como `handleOrderPlaced` para manejar eventos de nuevas órdenes.  Implementa la lógica de procesamiento de mensajes y maneja errores simulados que pueden enviar mensajes a la DLQ.
- **consumer.controller.ts**: Controlador de microservicio que gestiona eventos y comandos:
    - `@EventPattern('order-placed')`: Escucha el evento `order-placed` y procesa nuevas órdenes.
    - `@MessagePattern({ cmd: 'fetch-orders' })`: Maneja comandos para obtener las órdenes almacenadas.
- **dead-letter.controller.ts**: Controlador para manejar mensajes muertos:
  - `@EventPattern('dead_letter')`: Escucha los mensajes que son enviados a la Dead Letter Queue y permite procesarlos o registrarlos en logs para revisión.
### 6. `main.ts`

Archivo principal de inicio que arranca la aplicación. Inicializa tanto el servidor HTTP (para el productor) como el microservicio (para el consumidor) y los configura para que escuchen en el puerto especificado.

## Configuración de Variables de Entorno

Para configurar el transporte de mensajes y otros parámetros, debes definir las siguientes variables en un archivo `.env`:

- **TRANSPORT_TYPE**: Tipo de transporte (por ejemplo, `rmq` para RabbitMQ o `kafka`).
- **RABBITMQ_URL**: URL de conexión para RabbitMQ (si usas `rmq`).
- **QUEUE_NAME**: Nombre de la cola en RabbitMQ.
- **RABBITMQ_PORT**: Puerto utilizado para las conexiones AMQP de RabbitMQ.
- **RABBITMQ_PORT_ADMIN**: Puerto utilizado para la consola de administración de RabbitMQ.
- **RABBITMQ_DEFAULT_USER**: Nombre de usuario predeterminado para RabbitMQ.
- **RABBITMQ_DEFAULT_PASS**: Contraseña predeterminada para RabbitMQ.
- **KAFKA_BROKER_URL**: URL del broker de Kafka (si usas `kafka`).
- **KAFKA_CONSUMER_GROUP**: Nombre del grupo de consumidores en Kafka.

## Endpoints

### Productor (HTTP):

- **POST** `/orders/place-order`: Envía una nueva orden.
- **GET** `/orders`: Obtiene las órdenes actuales.

### Consumidor (Microservicio):

- **@EventPattern('order-placed')**: Escucha el evento de nueva orden.
- **@MessagePattern({ cmd: 'fetch-orders' })**: Responde con las órdenes almacenadas.

### Dead Letter (Microservicio):

- **@EventPattern('dead_letter')**: Escucha y maneja los mensajes que han fallado repetidamente y han sido redirigidos a la Dead Letter Queue.
