// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getConsumerClientOptions } from './messaging/messaging-connection.config';
import { ConsumerModule } from './consumer/consumer.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const transportType = configService.get<string>('TRANSPORT_TYPE');

  const consumerOptions = getConsumerClientOptions(configService);
  const consumerApp = await NestFactory.createMicroservice(
    ConsumerModule,
    consumerOptions,
  );

  await consumerApp.listen();
  await app.listen(3000);

  console.log(`OrderHub is listening on port 3000 (HTTP) and connected to ${transportType.toUpperCase()}...`);
}

bootstrap();
