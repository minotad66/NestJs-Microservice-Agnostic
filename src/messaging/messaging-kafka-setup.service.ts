// src/messaging/messaging-kafka-setup.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class MessagingKafkaSetupService implements OnModuleInit {
  private kafkaClient: ClientKafka;
  private readonly logger = new Logger(MessagingKafkaSetupService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.setupKafka();
  }

  private setupKafka() {
    const brokers = [this.configService.get<string>('KAFKA_BROKER_URL')];
    const groupId = this.configService.get<string>('KAFKA_CONSUMER_GROUP');

    this.kafkaClient = new ClientKafka({
      client: {
        brokers,
      },
      consumer: {
        groupId,
      },
    });

    this.logger.log(`Kafka setup complete. Connected to brokers: ${brokers}`);
  }
}
