import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Post } from './post.entity';
import { Session } from './session.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
    nullable: true,
    unique: true
  })
  username: string;

  @Column({
    type: "text",
    unique: true
  })
  email: string;

  @Column("text", {
    nullable: true
  })
  emailConfirmationLink: string;

  @Column("text")
  firstName: string;

  @Column("text")
  lastName: string;

  @Column({
    type: "text",
    nullable: true,
  })
  password: string;

  @Column({
    type: "text",
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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(type => Session, (session) => session.user)
  sessions: Session[]

  @OneToMany(type => Post, (post) => post.author)
  posts: Post[];
}