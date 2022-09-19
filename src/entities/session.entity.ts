import { DeviceSchema } from 'src/schemas/device.schema';
import { Entity, Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Session {
  @PrimaryColumn()
  id: number;

  @ManyToOne(
    type => User, 
    (user) => user.sessions, 
    { onDelete: "CASCADE" }
  ) @JoinColumn()
  user: User;

  @Column("text")
  accessToken: string;

  @Column("text")
  refreshToken: string;

  @Column({
    type: "jsonb",
  })
  device: DeviceSchema;

  @CreateDateColumn()
  createdAt: Date;
}