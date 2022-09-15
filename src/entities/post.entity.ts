import { postCache } from 'src/interfaces/post.cacheData';
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne, 
  JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User) @JoinColumn()
  author: User;

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
  cacheData: postCache;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}