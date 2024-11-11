// src/messaging/messaging-connection.config.ts

import { ConfigService } from '@nestjs/config';
import { Transport, ClientProviderOptions, MicroserviceOptions } from '@nestjs/microservices';

export const getConsumerClientOptions = (
  configService: ConfigService,
): MicroserviceOptions => {
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  if (transportType === 'rmq') {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: configService.get<string>('QUEUE_NAME'),
        noAck: false,
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-ttl': 10000,
            'x-dead-letter-exchange': 'dead_letter_exchange',
            'x-dead-letter-routing-key': 'dead_letter_queue',
          },
        },
      },
    };
  } else if (transportType === 'kafka') {
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
  } else {
    throw new Error(`Unsupported transport type: ${transportType}`);
  }
};

export const getProducerClientOptions = (
  configService: ConfigService,
): ClientProviderOptions => {
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  if (transportType === 'rmq') {
    return {
      name: 'ORDERS_PRODUCER',
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: configService.get<string>('QUEUE_NAME'),
        queueOptions: {
          durable: true,
          arguments: {
            'x-message-ttl': 10000,
            'x-dead-letter-exchange': 'dead_letter_exchange',
            'x-dead-letter-routing-key': 'dead_letter_queue',
          },
        },
      },
    };
  } else if (transportType === 'kafka') {
    return {
      name: 'ORDERS_PRODUCER',
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [configService.get<string>('KAFKA_BROKER_URL')],
        },
        producer: {},
      },
    };
  } else {
    throw new Error(`Unsupported transport type: ${transportType}`);
  }
};

export const getDLQClientOptions = (
  configService: ConfigService,
): ClientProviderOptions => {
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  if (transportType === 'rmq') {
    return {
      name: 'DLQ_CLIENT',
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: 'dead_letter_queue',
        queueOptions: { durable: true },
      },
    };
  } else if (transportType === 'kafka') {
    return {
      name: 'DLQ_CLIENT',
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [configService.get<string>('KAFKA_BROKER_URL')],
        },
        consumer: {
          groupId: configService.get<string>('KAFKA_CONSUMER_GROUP_DLQ'),
        },
      },
    };
  } else {
    throw new Error(`Unsupported transport type: ${transportType}`);
  }
};
