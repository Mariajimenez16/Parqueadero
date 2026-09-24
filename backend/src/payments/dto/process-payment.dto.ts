import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty({ message: 'El método de pago es obligatorio (EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, PAGO_DIGITAL).' })
  metodoPago: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
