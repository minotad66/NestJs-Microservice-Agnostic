// src/consumer/consumer.controller.ts
import { Controller, Inject, Logger } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  MessagePattern,
  ClientProxy,
} from '@nestjs/microservices';
import { OrderDto } from '../dtos/order.dto';
import { lastValueFrom } from 'rxjs';

@Controller()
export class ConsumerController {
  private retryCounts: { [key: string]: number } = {};
  private pendingRetries: {
    order: OrderDto;
    originalMessage: any;
    channel: any;
  }[] = []; // Cola en memoria para mensajes pendientes
  private processingRetry = false; // Bandera para evitar concurrencia
  private readonly logger = new Logger(ConsumerController.name);

  constructor(
    private readonly consumerService: ConsumerService,
    @Inject('DLQ_CLIENT') private readonly dlqClient: ClientProxy,
  ) {}

  @EventPattern('order-placed')
  async handleOrderPlaced(
    @Payload() order: OrderDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    const messageId = order.email;

    try {
      await this.consumerService.handleOrderPlaced(order);
      channel.ack(originalMessage);
      delete this.retryCounts[messageId];
    } catch (error) {
      this.logger.error(
        `Error processing order ${order.email}:`,
        error.message,
      );

      // Incrementar el contador y manejar reintentos en `processRetries`
      this.retryCounts[messageId] = (this.retryCounts[messageId] || 0) + 1;

      // Agregar el mensaje fallido a la lista de reintentos
      this.pendingRetries.push({ order, originalMessage, channel });
      channel.ack(originalMessage); // Evitar reencolar en la cola principal
      await this.processRetries(); // Iniciar el proceso de reintentos
    }
  }

  @MessagePattern({ cmd: 'fetch-orders' })
  async getOrders(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const orders = await this.consumerService.getOrders();
      channel.ack(originalMessage);
      return orders;
    } catch (error) {
      this.logger.error(`Error fetching orders: ${error.message}`);
      channel.nack(originalMessage, false, true); // Requeue para reintentos
      throw error;
    }
  }

  private async processRetries() {
    if (this.processingRetry) return;
    this.processingRetry = true;

    while (this.pendingRetries.length > 0) {
      const { order } = this.pendingRetries[0];
      const messageId = order.email;

      try {
        await this.consumerService.handleOrderPlaced(order);
        this.logger.log(`Retry successful for order ${order.email}`);
        this.pendingRetries.shift();
        delete this.retryCounts[messageId];
      } catch (error) {
        this.logger.error(
          `Retry failed for order ${order.email}: ${error.message}`,
        );

        this.retryCounts[messageId] = (this.retryCounts[messageId] || 0) + 1;
        const retryCount = this.retryCounts[messageId];

        if (retryCount >= 3) {
          this.logger.warn(
            `Max retries reached for order ${order.email}. Sending to DLQ.`,
          );
          await lastValueFrom(this.dlqClient.emit('dead_letter_queue', order));
          this.pendingRetries.shift();
          delete this.retryCounts[messageId];
        } else {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    this.processingRetry = false;
  }
}
