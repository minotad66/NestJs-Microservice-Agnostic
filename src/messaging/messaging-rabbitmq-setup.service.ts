import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import * as amqp from 'amqplib';

@Injectable()
export class MessagingRabbitmqSetupService implements OnModuleInit {
  private connection: amqp.Connection; // Conexión de amqplib
  private channel: amqp.Channel; // Canal de RabbitMQ para crear colas/exchanges

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.setupRabbitMQ(); // Configuración de las colas/exchanges
  }

  public async setupRabbitMQ() {
    // Obtener la configuración de RabbitMQ de variables de entorno
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
    const mainQueue = this.configService.get<string>('QUEUE_NAME'); // Cola principal
    const retryQueue = `${mainQueue}_retry`; // Cola de reintento
    const deadLetterExchange = 'dead_letter_exchange'; // Exchange de dead letters (DLX)

    // Conexión y canal de RabbitMQ
    this.connection = await amqp.connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();

    // Configurar colas y exchanges
    await this.configureQueues(mainQueue, retryQueue, deadLetterExchange);

    console.log('RabbitMQ setup complete with Retry Queue, DLX, and DLQ.');

    // Cerrar el canal y la conexión después de la configuración
    await this.channel.close();
    await this.connection.close();
  }

  private async configureQueues(
    mainQueue: string,
    retryQueue: string,
    deadLetterExchange: string,
  ) {
    // Configurar el exchange de dead letters
    await this.channel.assertExchange(deadLetterExchange, 'direct', {
      durable: true,
    });

    // Configuración de la cola principal con DLX que redirige a retry_queue en caso de fallo
    await this.channel.assertQueue(mainQueue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dead_letter_exchange', // Apunta al DLX
        'x-dead-letter-routing-key': 'orders_queue_retry', // Enviar a la cola de reintento
      },
    });

    // Configuración de la cola de reintento (retry_queue) para enviar al RetryController
    await this.channel.assertQueue(retryQueue, {
      durable: true,
      arguments: {
        'x-message-ttl': 5000, // Tiempo de vida antes de redirigir
        'x-dead-letter-exchange': 'dead_letter_exchange', // Envía a DLX después de reintentos
        'x-dead-letter-routing-key': 'dead_letter_queue', // Routing key para dead-letter
      },
    });

    // Configuración de la cola de dead letters
    await this.channel.assertQueue('dead_letter_queue', { durable: true });
    await this.channel.bindQueue(
      'dead_letter_queue',
      deadLetterExchange,
      'dead_letter_queue',
    );

    console.log(
      'RabbitMQ setup complete with Dead Letter Exchange and Retry Queue.',
    );
  }
}
