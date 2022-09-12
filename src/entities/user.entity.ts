import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { userAdditionalInfo } from 'src/interfaces/user.additionalInfo.interface';
import { userOauth } from 'src/interfaces/user.oauth.interface';

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

  @Column("text")
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
}