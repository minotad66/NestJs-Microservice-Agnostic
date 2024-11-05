// src/consumer/retry/retry.controller.ts
import { Controller } from '@nestjs/common';
import { Ctx, Payload, RmqContext, EventPattern } from '@nestjs/microservices';
import { ConsumerService } from '../consumer.service';

@Controller('retry')
export class RetryController {
  private retryCounts: { [key: string]: number } = {}; // Almacena el conteo de reintentos

  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern('retry_order')
  async handleRetryOrder(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      console.log('Retrying order:', data);
      await this.consumerService.handleOrderPlaced(data);
      channel.ack(originalMessage); // Acknowledge si el procesamiento fue exitoso
    } catch (error) {
      console.error(`Retry failed for order ${data.email}:`, error.message);

      const messageId = data.email;
      this.retryCounts[messageId] = (this.retryCounts[messageId] || 0) + 1;
      const retryCount = this.retryCounts[messageId];

      console.log('Número de reintentos:', retryCount);

      if (retryCount >= 3) {
        console.warn(
          `Max retries reached for order ${data.email}. Sending to DLQ.`,
        );
        delete this.retryCounts[messageId]; // Limpiamos el conteo después de alcanzar el máximo de reintentos
        channel.nack(originalMessage, false, false); // Envía a la DLQ y no reencola
      } else {
        console.log(`Retry attempt ${retryCount} for order ${data.email}`);
        channel.nack(originalMessage, false, true); // Requeue para más reintentos
      }
    }
  }
}
