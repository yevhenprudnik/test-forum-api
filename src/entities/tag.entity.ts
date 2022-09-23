import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Tag {
  @PrimaryColumn("text")
  name: string;

  @Column('int')
  followersCount : number

  @Column('int')
  postsCount : number

  @CreateDateColumn()
  createdAt: Date;
}