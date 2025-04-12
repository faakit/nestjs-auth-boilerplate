import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  IsIn,
  IsPhoneNumber,
  MaxDate,
  IsDate,
} from 'class-validator';
import { Sex } from 'src/shared/enums/sex.enum';
import { BloodType } from 'src/shared/enums/blood-type.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  surname: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(Sex))
  sex: Sex;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @MaxDate(() => new Date())
  birthdate: Date;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  diseases: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  familyDiseases: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  surgeries: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  allergies: string;

  @IsOptional()
  @IsBoolean()
  smoking: boolean;

  @IsOptional()
  @IsBoolean()
  alcohol: boolean;

  @IsOptional()
  @IsNumber()
  height: number;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(BloodType))
  bloodType: BloodType;
}
