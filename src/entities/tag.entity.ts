import { Entity, CreateDateColumn, PrimaryColumn, ManyToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class Tag {
  @PrimaryColumn()
  name: string;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];

  @CreateDateColumn({
    type: 'timestamptz'
  })
  createdAt: Date;
}