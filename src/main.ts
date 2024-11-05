import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  getConsumerClientOptions,
  getConsumerRetryClientOptions,
} from './messaging/messaging-connection.config';
import { RetryMicroserviceModule } from './consumer/retry/retry.module';
import { ConsumerModule } from './consumer/consumer.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Crear el microservicio para la cola principal con su módulo específico
  const consumerOptions = getConsumerClientOptions(configService);
  const consumerApp = await NestFactory.createMicroservice(
    ConsumerModule,
    consumerOptions,
  );

  // Crear el microservicio para la cola de reintentos con su módulo específico
  const retryOptions = getConsumerRetryClientOptions(configService);
  const retryApp = await NestFactory.createMicroservice(
    RetryMicroserviceModule,
    retryOptions,
  );

  await consumerApp.listen();
  await retryApp.listen();
  await app.listen(3000);

  console.log(
    'OrderHub is listening on port 3000 (HTTP) and connected to RabbitMQ microservices...',
  );
}

bootstrap();
