// src/producer/producer.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { getProducerClientOptions } from '../messaging/messaging-connection.config';
import { ProducerService } from './producer.service';
import { ProducerController } from './producer.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ORDERS_PRODUCER',
        useFactory: (configService: ConfigService) =>
          getProducerClientOptions(configService),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
