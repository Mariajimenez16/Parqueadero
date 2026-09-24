import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'Debe proporcionar la placa o el código QR del vehículo.' })
  identifier: string;

  @IsString()
  @IsOptional()
  spaceId?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
