import { Module } from '@nestjs/common';
import { RetryController } from './retry.controller';
import { ConsumerService } from '../consumer.service';

@Module({
  controllers: [RetryController], // Solo los controladores necesarios para reintentos
  providers: [ConsumerService],
})
export class RetryMicroserviceModule {}
