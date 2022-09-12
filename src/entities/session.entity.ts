import { deviceInterface } from 'src/interfaces/device.interface';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User) @JoinColumn()
  user: User;

  @Column("text")
  accessToken: string;

  @Column("text")
  refreshToken: string;

  @Column({
    type: "jsonb",
  })
  device: deviceInterface;

  @CreateDateColumn()
  createdAt: Date;
}