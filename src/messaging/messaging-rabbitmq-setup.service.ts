// src/messaging/messaging-rabbitmq-setup.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class MessagingRabbitmqSetupService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(MessagingRabbitmqSetupService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.setupRabbitMQ();
  }

  private async setupRabbitMQ() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
    const mainQueue = this.configService.get<string>('QUEUE_NAME');
    const deadLetterExchange = 'dead_letter_exchange';

    this.connection = await amqp.connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();

    // Configurar el exchange de dead letters
    await this.channel.assertExchange(deadLetterExchange, 'direct', {
      durable: true,
    });

    // Configuración de la cola principal
    await this.channel.assertQueue(mainQueue, {
      durable: true,
      arguments: {
        'x-message-ttl': 10000,
        'x-dead-letter-exchange': deadLetterExchange,
        'x-dead-letter-routing-key': 'dead_letter_queue',
      },
    });

    // Configuración de la cola de dead letters
    await this.channel.assertQueue('dead_letter_queue', { durable: true });
    await this.channel.bindQueue(
      'dead_letter_queue',
      deadLetterExchange,
      'dead_letter_queue',
    );

    this.logger.log(
      'RabbitMQ setup complete with Dead Letter Exchange and DLQ.',
    );

    // Cerrar el canal y la conexión después de la configuración
    await this.channel.close();
    await this.connection.close();
  }
}
