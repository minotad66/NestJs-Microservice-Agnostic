import { Injectable } from '@nestjs/common';
import { OrderDto } from '../dtos/order.dto';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// src/consumer/consumer.service.ts
@Injectable()
export class ConsumerService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private orders: OrderDto[] = [];

  async handleOrderPlaced(order: OrderDto): Promise<{ message: string }> {
    if (order.email.includes('error')) {
      throw new Error('Simulated processing error');
    }

    const url = `${this.configService.get('URL_POKEMONS')}/limit=${
      order.quantity
    }`;

    const response = await lastValueFrom(this.httpService.get(url));
    this.orders.push({ ...order, responseApi: response.data });
    return { message: 'Order processed successfully' };
  }

  getOrders(): OrderDto[] {
    return this.orders;
  }
}
