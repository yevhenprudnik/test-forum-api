import { IsArray, IsNotEmpty } from "class-validator";
import { Tag } from "src/entities/tag.entity";

export class PostDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  description: string;
  @IsArray()
  tags: Tag[];
  @IsNotEmpty()
  picture: string;
  @IsNotEmpty()
  coverPicture: string;
}