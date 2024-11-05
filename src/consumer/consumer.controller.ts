import { Controller, Inject } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  ClientProxyFactory,
  Transport,
  MessagePattern,
  ClientProxy,
} from '@nestjs/microservices';
import { OrderDto } from '../dtos/order.dto';
import { ConfigService } from '@nestjs/config';

@Controller()
export class ConsumerController {
  constructor(
    private readonly consumerService: ConsumerService,
    @Inject('RETRY_PRODUCER') private readonly retryProducer: ClientProxy, // Renombrado a RETRY_PRODUCER
  ) {}

  @EventPattern('order-placed')
  async handleOrderPlaced(
    @Payload() order: OrderDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.consumerService.handleOrderPlaced(order);
      channel.ack(originalMessage);
    } catch (error) {
      console.error(`Error processing order: ${error.message}`);
      channel.ack(originalMessage); // ACK para evitar requeue automático

      // Reenviar a la cola de reintentos con el patrón 'retry_order'
      this.retryProducer.emit('retry_order', order);
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
      console.error(`Error fetching orders: ${error.message}`);
      channel.nack(originalMessage, false, true); // Requeue para reintentos
      throw error;
    }
  }
}
