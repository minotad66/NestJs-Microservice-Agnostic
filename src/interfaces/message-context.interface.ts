// src/interfaces/message-contex.interfaces.ts
export interface IMessageContext {
  acknowledgeMessage(message: any): void;
  rejectMessage(message: any, requeue?: boolean): void;
}
