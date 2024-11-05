import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('dead-letter')
export class DeadLetterController {
  @EventPattern('dead_letter')
  handleDeadLetter(@Payload() message: any) {
    console.log('Received dead letter:', message);
    // Lógica para manejar mensajes fallidos, como registrarlos o reenviarlos
  }
}
