import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User) @JoinColumn()
  author: User;

  @ManyToOne(type => Comment, { nullable: true }) @JoinColumn()
  comment: Comment

  @ManyToOne(type => Post, { nullable: true }) @JoinColumn()
  post: Post

  @Column('text')
  likeableType : string

  @CreateDateColumn()
  createdAt: Date;
}