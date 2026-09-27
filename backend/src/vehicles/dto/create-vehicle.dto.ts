import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty({ message: 'La placa es obligatoria.' })
  placa: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de vehículo es obligatorio.' })
  type: string; // AUTOMOVIL, MOTOCICLETA, BICICLETA, ELECTRICO

  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria.' })
  marca: string;

  @IsString()
  @IsNotEmpty({ message: 'El modelo es obligatorio.' })
  modelo: string;

  @IsString()
  @IsNotEmpty({ message: 'El color es obligatorio.' })
  color: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  status?: string; // AUTORIZADO, NO_AUTORIZADO, INACTIVO
}
