// consumer/consumer.module.ts
import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { DeadLetterController } from './dead-letter/dead-letter.controller';
import { RetryController } from './retry/retry.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { getProducerRetryClientOptions } from '../messaging/messaging-connection.config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'RETRY_PRODUCER', // Renombrado a RETRY_PRODUCER
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: getProducerRetryClientOptions,
      },
    ]),
  ],
  controllers: [ConsumerController, DeadLetterController, RetryController],
  providers: [ConsumerService],
})
export class ConsumerModule {}
