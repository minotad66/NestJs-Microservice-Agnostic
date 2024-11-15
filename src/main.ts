// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getConsumerClientOptions } from './messaging/messaging-connection.config';
import { ConsumerModule } from './consumer/consumer.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  const port = configService.get('PORT');
  const consumerOptions = getConsumerClientOptions(configService);
  const consumerApp = await NestFactory.createMicroservice(
    ConsumerModule,
    consumerOptions,
  );

  await consumerApp.listen();
  await app.listen(port);

  logger.log(
    `OrderHub is listening on port ${port} (HTTP) and connected to ${transportType.toUpperCase()}...`,
  );
}

bootstrap();
