import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTariffDto {
  @IsString()
  @IsNotEmpty({ message: 'El tipo de usuario es obligatorio.' })
  userType: string; // ESTUDIANTE, DOCENTE, ADMINISTRATIVO, VISITANTE

  @IsString()
  @IsNotEmpty({ message: 'El tipo de vehículo es obligatorio.' })
  vehicleType: string; // AUTOMOVIL, MOTOCICLETA, BICICLETA, ELECTRICO

  @IsNumber({}, { message: 'El valor por hora debe ser numérico.' })
  @Min(0)
  valorHora: number;

  @IsNumber({}, { message: 'El valor mínimo debe ser numérico.' })
  @Min(0)
  valorMinimo: number;

  @IsNumber({}, { message: 'El valor máximo debe ser numérico.' })
  @IsOptional()
  valorMaximo?: number;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
