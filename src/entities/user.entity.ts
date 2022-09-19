import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { userAdditionalInfo } from 'src/interfaces/user.additionalInfo.interface';
import { userOauth } from 'src/interfaces/user.oauth.interface';
import { Session } from './session.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
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
  additionalInfo: userAdditionalInfo;

  @Column({
    type: "jsonb",
    default: {}
  })
  oauth: userOauth;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(type => Session, (session) => session.user)
  sessions: Session[]
}