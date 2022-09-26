import { CacheData } from 'src/dtos/cacheData.dto';
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne, 
  ManyToMany,
  JoinTable} from 'typeorm';
import { Tag } from './tag.entity';
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

  @ManyToMany(() => Tag, (tag) => tag.posts, { cascade: true, eager: true })
  @JoinTable()
  tags: Tag[];

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
