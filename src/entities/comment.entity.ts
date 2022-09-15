import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User) @JoinColumn()
  author: User;

  @ManyToOne(type => Post, { nullable: true }) @JoinColumn()
  post: Post

  @ManyToOne(type => Comment, { nullable: true }) @JoinColumn()
  commentReply: Comment

  @Column('text')
  commentableType : string

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}