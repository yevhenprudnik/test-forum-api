import { IsDefined, IsNotEmpty } from "class-validator";

export class PostDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsDefined()
  tags: string[];
  @IsNotEmpty()
  picture: string;
  @IsNotEmpty()
  coverPicture: string;
}