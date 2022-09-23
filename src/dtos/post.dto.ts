import { IsArray, IsNotEmpty } from "class-validator";

export class PostDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsArray()
  tags: string[];
  @IsNotEmpty()
  picture: string;
  @IsNotEmpty()
  coverPicture: string;
}