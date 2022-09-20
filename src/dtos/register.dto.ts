import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  username: string;
  @IsEmail()
  email: string;
  @Length(5, 32, { message: 'Password length must be at least 5 characters and not more than 32' })
  password: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
}