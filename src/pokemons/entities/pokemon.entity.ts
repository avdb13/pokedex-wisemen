import {
  Relation,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

abstract class NameAndUrl {
  @Column()
  name: string;

  @Column()
  url: string;
}

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Ability, (ability) => ability.pokemon)
  abilities: Relation<Ability[]>;

  @Column()
  base_experience: number;

  // seems to always be of length one so let's inline it
  @Column(() => NameAndUrl)
  form: NameAndUrl;

  @OneToMany(() => GameIndex, (gameIndex) => gameIndex.pokemon)
  game_indices: Relation<GameIndex[]>;

  @Column()
  height: number;

  // many-to-many since there's a finite number of items
  @ManyToMany(() => Item)
  @JoinTable()
  held_items: Relation<Item[]>;

  @Column()
  is_default: boolean;

  @Column()
  location_area_encounters: string;

  @ManyToMany(() => Move)
  @JoinTable()
  moves: Relation<Move[]>;

  @Column()
  order: number;

  @OneToMany(() => PastType, (past_type) => past_type.pokemon)
  past_types: Relation<PastType[]>;

  @Column(() => NameAndUrl)
  // all species arrays are of length one in our data
  species: NameAndUrl;

  @OneToMany(() => Sprite, (sprite) => sprite.pokemon)
  sprites: Relation<Sprite[]>;

  @OneToMany(() => Stat, (stat) => stat.pokemon)
  stats: Relation<Stat[]>;

  @OneToMany(() => Kind, (kind) => kind.pokemon)
  types: Relation<Kind[]>;

  @Column()
  weight: number;
}

@Entity()
export class Ability extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  is_hidden: boolean;

  @Column()
  slot: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.abilities)
  pokemon: Relation<Pokemon>;
}

@Entity()
export class GameIndex extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.forms)
  pokemon: Relation<Pokemon>;
}

@Entity()
export class ItemVersionDetails extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rarity: number;

  @ManyToOne(() => Item, (item) => item.version_details)
  item: Relation<Item>;
}

@Entity()
export class Item extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.held_items)
  pokemon: Relation<Pokemon>;

  @OneToMany(() => ItemVersionDetails, (details) => details.item)
  version_details: Relation<ItemVersionDetails[]>;
}

@Entity()
export class MoveVersionDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level_learned_at: number;

  @Column(() => NameAndUrl)
  move_learn_method: NameAndUrl;

  @Column(() => NameAndUrl)
  version_group: NameAndUrl;

  @ManyToOne(() => Move, (move) => move.version_group_details)
  move: Relation<Move>;
}

@Entity()
export class Move extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.moves)
  pokemon: Relation<Pokemon>;

  @OneToMany(() => MoveVersionDetails, (details) => details.move)
  version_group_details: Relation<MoveVersionDetails[]>;
}

@Entity()
export class PastType extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => PastType, (past_type) => past_type.types)
  types: Relation<PastTypeKind[]>;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.past_types)
  pokemon: Relation<Pokemon>;
}

@Entity()
export class PastTypeKind extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PastTypeKind, (kind) => kind.parent)
  parent: Relation<PastType>;

  @Column()
  slot: number;
}

abstract class SpriteMap {
  @Column({ type: 'varchar', nullable: true, default: null })
  front_default?: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_female?: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_shiny?: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_shiny_female?: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_default?: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_female?: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_shiny?: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_shiny_female?: string | null;
}

@Entity()
export class Sprite extends SpriteMap {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  pokemon: Relation<Pokemon>;

  @Column({ type: 'varchar', nullable: true, default: null })
  title?: string | null;

  @Column({ nullable: true, default: false })
  is_other?: boolean;

  @Column({ nullable: true, default: false })
  is_animated?: boolean;

  @Column({ nullable: true, default: false })
  is_icons?: boolean;
}

@Entity()
export class Kind extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.types)
  pokemon: Relation<Pokemon>;

  @Column()
  slot: number;
}

@Entity()
export class Stat extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  pokemon: Relation<Pokemon>;

  @Column()
  base_stat: number;

  @Column()
  effort: number;
}

const generationRecord = {
  1: ['red-blue', 'yellow'],
  2: ['crystal', 'gold', 'silver'],
  3: ['emerald', 'firered-leafgreen', 'ruby-sapphire'],
  4: ['diamond-pearl', 'heartgold-soulsilver', 'platinum'],
  5: ['black-white'],
  6: ['omegaruby-alphasapphire', 'x-y'],
  7: ['ultra-sun-ultra-moon'],
  8: [],
} as const satisfies Record<number, string[]>;

export const titles = Object.values(generationRecord).flatMap(
  (x) => x as string[],
);

export type Title =
  (typeof generationRecord)[keyof typeof generationRecord][number];
