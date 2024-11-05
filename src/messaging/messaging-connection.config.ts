// src/messaging/messaging-connection.config.ts

import { ConfigService } from '@nestjs/config';
import {
  Transport,
  ClientProviderOptions,
  MicroserviceOptions,
} from '@nestjs/microservices';

export const getConsumerClientOptions = (
  configService: ConfigService,
): MicroserviceOptions => {
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  switch (transportType) {
    case 'rmq':
      return {
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL')],
          queue: configService.get<string>('QUEUE_NAME'), // Cola principal 'orders-queue'
          noAck: false,
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'dead_letter_exchange', // Apunta al DLX para reintento o DLQ
              'x-dead-letter-routing-key': 'orders_queue_retry', // Routing a retry_queue o retry_order
            },
          },
        },
      };
    case 'kafka':
      return {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [configService.get<string>('KAFKA_BROKER_URL')],
          },
          consumer: {
            groupId: configService.get<string>('KAFKA_CONSUMER_GROUP'),
          },
        },
      };
    default:
      throw new Error(`Unsupported transport type: ${transportType}`);
  }
};

// Configuración para el cliente de la cola de reintentos
export const getConsumerRetryClientOptions = (
  configService: ConfigService,
): MicroserviceOptions => {
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  switch (transportType) {
    case 'rmq':
      return {
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL')],
          queue: 'orders_queue_retry', // Cola específica de reintentos
          noAck: false,
          queueOptions: {
            durable: true,
            arguments: {
              'x-message-ttl': 5000, // Tiempo de vida antes de reenviar
              'x-dead-letter-exchange': 'dead_letter_exchange', // Envía a DLX después de reintentos
              'x-dead-letter-routing-key': 'dead_letter_queue', // Envía a la DLQ si falla de nuevo
            },
          },
        },
      };
    case 'kafka':
      // Configuración para Kafka, en caso de añadir lógica de reintentos
      return {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [configService.get<string>('KAFKA_BROKER_URL')],
          },
          consumer: {
            groupId: configService.get<string>('KAFKA_RETRY_CONSUMER_GROUP'),
          },
        },
      };
    default:
      throw new Error(`Unsupported transport type for retry: ${transportType}`);
  }
};

export const getProducerRetryClientOptions = (
  configService: ConfigService,
): ClientProviderOptions => {
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  switch (transportType) {
    case 'rmq':
      return {
        name: 'RETRY_PRODUCER',
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL')],
          queue: 'orders_queue_retry',
          queueOptions: {
            durable: true,
            arguments: {
              'x-message-ttl': 5000, // Tiempo de vida antes de reenviar
              'x-dead-letter-exchange': 'dead_letter_exchange', // Envía a DLX después de reintentos
              'x-dead-letter-routing-key': 'dead_letter_queue', // Envía a la DLQ si falla de nuevo
            },
          },
        },
      };
    case 'kafka':
      return {
        name: 'RETRY_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [configService.get<string>('KAFKA_BROKER_URL')],
          },
        },
      };
    default:
      throw new Error(`Unsupported transport type: ${transportType}`);
  }
};

// Configuración del productor
export const getProducerClientOptions = (
  configService: ConfigService,
): ClientProviderOptions => {
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  switch (transportType) {
    case 'rmq':
      return {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('RABBITMQ_URL')],
          queue: configService.get<string>('QUEUE_NAME'), // Cola principal de órdenes
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'dead_letter_exchange', // Apunta al DLX para reintento o DLQ
              'x-dead-letter-routing-key': 'orders_queue_retry', // Routing a retry_queue o retry_order
            },
          },
        },
      };
    case 'kafka':
      return {
        name: 'ORDERS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [configService.get<string>('KAFKA_BROKER_URL')],
          },
        },
      };
    default:
      throw new Error(`Unsupported transport type: ${transportType}`);
  }
};
