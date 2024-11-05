// src/messaging/messaging.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagingRabbitmqSetupService } from './messaging-rabbitmq-setup.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      // Selección del servicio de setup basado en el TRANSPORT_TYPE
      provide: 'MessagingSetupService',
      useFactory: (configService: ConfigService) => {
        const transportType = configService.get<string>('TRANSPORT_TYPE');
        if (transportType === 'rmq') {
          return new MessagingRabbitmqSetupService(configService);
        } else if (transportType === 'kafka') {
          throw new Error(`Unsupported transport type: ${transportType}`);
          // return new MessagingKafkaSetupService(configService);
        } else {
          throw new Error(`Unsupported transport type: ${transportType}`);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MessagingSetupService'], // Exporta el servicio de setup seleccionado
})
export class MessagingModule {}
