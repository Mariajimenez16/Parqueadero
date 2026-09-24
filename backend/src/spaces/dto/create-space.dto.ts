import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty({ message: 'El código del espacio es obligatorio (ej. A-01).' })
  codigo: string;

  @IsInt()
  @IsNotEmpty({ message: 'El número de espacio es obligatorio.' })
  numero: number;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de espacio es obligatorio.' })
  tipo: string; // AUTOMOVIL, MOTOCICLETA, PREFERENCIAL

  @IsString()
  @IsNotEmpty({ message: 'La zona del espacio es obligatoria.' })
  zona: string;

  @IsString()
  @IsOptional()
  estado?: string; // DISPONIBLE, OCUPADO, RESERVADO, MANTENIMIENTO, INACTIVO
}
