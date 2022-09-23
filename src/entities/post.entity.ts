import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne, 
  JoinColumn} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text"
  })
  title: string;

  @Column("text")
  description: string;

  @Column("text", {
    nullable: true
  })
  picture: string;

  @Column("text", {
    nullable: true
  })
  coverPicture: string;

  @Column("text", {
    array: true,
    nullable: true
  })
  tags: string[];

  @Column({
    type: "jsonb",
  })
  cacheData: {
    viewsCount : number,
    likesCount: number,
    savesCount: number
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(type => User, (user) => user.posts, { onDelete: "CASCADE" }) 
  @JoinColumn()
  author: User;

}