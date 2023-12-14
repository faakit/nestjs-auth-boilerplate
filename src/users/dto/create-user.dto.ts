import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(8)
  passwordConfirmation: string;
}
