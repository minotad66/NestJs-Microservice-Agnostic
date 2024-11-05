import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OrderDto } from '../dtos/order.dto';
import { timeout } from 'rxjs';

@Injectable()
export class ProducerService {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly clientProxy: ClientProxy,
  ) {}

  placeOrder(order: OrderDto) {
    this.clientProxy.emit('order-placed', order);
    return { message: 'Order Placed!' };
  }

  getOrders() {
    return this.clientProxy
      .send({ cmd: 'fetch-orders' }, {})
      .pipe(timeout(5000));
  }
}
