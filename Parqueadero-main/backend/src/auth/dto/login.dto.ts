import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser un email válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres.' })
  password: string;
}
