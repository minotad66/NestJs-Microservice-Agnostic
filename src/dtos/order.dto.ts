// src/dtos/order.dto.ts

export class OrderDto {
  constructor(
    public email: string,
    public productName: string,
    public quantity: number,
  ) {}
}
