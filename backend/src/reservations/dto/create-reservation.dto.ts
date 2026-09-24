import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio.' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID del vehículo es obligatorio.' })
  vehicleId: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID del espacio es obligatorio.' })
  spaceId: string;

  @IsDateString({}, { message: 'La fecha debe ser una fecha ISO válida (YYYY-MM-DD).' })
  fecha: string;

  @IsDateString({}, { message: 'La hora de inicio debe ser una fecha/hora ISO válida.' })
  horaInicio: string;

  @IsDateString({}, { message: 'La hora de fin debe ser una fecha/hora ISO válida.' })
  horaFin: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
