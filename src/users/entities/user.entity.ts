import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ update: false })
  name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  //   @OneToMany(() => Team, (team) => team.user)
  //   teams: Relation<Team[]>;

  @CreateDateColumn({
    select: false,
    update: false,
    type: 'timestamp',
    // 6 === save as microseconds
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    select: false,
    update: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
