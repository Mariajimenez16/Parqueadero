import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterExitDto {
  @IsString()
  @IsNotEmpty({ message: 'Debe proporcionar la placa, código QR o ID de movimiento.' })
  identifier: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
