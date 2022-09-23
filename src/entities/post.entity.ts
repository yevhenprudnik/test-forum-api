import { CacheData } from 'src/schemas/cacheData.schema';
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    nullable: true
  })
  picture: string;

  @Column({
    nullable: true
  })
  coverPicture: string;

  @Column("simple-array")
  tags: string[];

  @Column({
    type: "jsonb",
  })
  metadata: CacheData;

  @CreateDateColumn({
    type: 'timestamptz'
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz'
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" }) 
  author: User;

}
