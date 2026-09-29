import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios.' })
  apellidos: string;

  @IsString()
  @IsNotEmpty({ message: 'El documento de identidad es obligatorio.' })
  documento: string;

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El número de teléfono es obligatorio.' })
  telefono: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @IsString()
  @IsOptional()
  userType?: string; // ESTUDIANTE, DOCENTE, ADMINISTRATIVO, VISITANTE

  @IsString()
  @IsOptional()
  role?: string; // ADMIN, VIGILANTE, CAJERO, USUARIO

  @IsString()
  @IsOptional()
  status?: string; // ACTIVO, BLOQUEADO, INACTIVO
}
