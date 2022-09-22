import { IsDefined, IsEmail } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;
  @IsDefined()
  password: string;
}