import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryColumn()
  name: string;

  @Column('int')
  followersCount: number

  @Column('int')
  postsCount: number

  @CreateDateColumn()
  createdAt: Date;
}