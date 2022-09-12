import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(type => User) @JoinColumn()
  user: User;

  @Column("text")
  accessToken: string;

  @Column("text")
  refreshToken: string;

  @Column({
    type: "text",
    nullable: true
  })
  device: string;

  @CreateDateColumn()
  createdAt: Date;
}