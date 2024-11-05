import { Injectable } from '@nestjs/common';
import { OrderDto } from '../dtos/order.dto';

// src/consumer/consumer.service.ts
@Injectable()
export class ConsumerService {
  private orders: OrderDto[] = [];

  async handleOrderPlaced(order: OrderDto): Promise<{ message: string }> {
    console.log(`Received a new order - customer: ${order.email}`);

    if (order.email.includes('error')) {
      throw new Error('Simulated processing error');
    }
    this.orders.push(order);

    return { message: 'Order processed successfully' };
  }

  getOrders(): OrderDto[] {
    return this.orders;
  }
}
