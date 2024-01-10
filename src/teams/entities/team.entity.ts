import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('int', { array: true, default: [] })
  pokemons: number[];
}
