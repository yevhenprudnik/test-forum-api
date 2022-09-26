import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Post } from './post.entity';
import { Session } from './session.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
    unique: true
  })
  username: string;

  @Column({
    unique: true
  })
  email: string;

  @Column({
    nullable: true
  })
  emailConfirmationLink: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    nullable: true,
  })
  profilePicture: string;

  @Column({
    type: "bool",
    default: false
  })
  confirmedEmail: boolean;

  @Column({
    type: "jsonb",
    default: {}
  })
  additionalInfo: {
    birthday?: Date;
    locate?: string;
    website?: string;
    bio?: string;
  };

  @Column({
    type: "jsonb",
    default: {}
  })
  oauth: {
    token: string;
    id: number;
    provider: string;
  };

  @CreateDateColumn({
    type: 'timestamptz'
  })
  createdAt: Date;

  @OneToMany( () => Session, (session) => session.user)
  sessions: Session[]

  @OneToMany( () => Post, (post) => post.author)
  posts: Post[];
}