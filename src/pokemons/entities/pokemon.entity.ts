import {
  Relation,
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

abstract class NameAndUrl {
  @Column()
  name: string;

  @Column()
  url: string;
}

@Entity({ name: 'pokemon' })
export class Pokemon {
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToMany(() => Ability, (ability) => ability.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  abilities: Relation<Ability[]>;

  @Column()
  base_experience: number;

  // seems to always be of length one so let's inline it
  @Column(() => NameAndUrl)
  form: NameAndUrl;

  @OneToMany(() => GameIndex, (gameIndex) => gameIndex.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  game_indices: Relation<GameIndex[]>;

  @Column()
  height: number;

  // many-to-many since there's a finite number of items
  @OneToMany(() => Item, (item) => item.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  held_items: Relation<Item[]>;

  @Column()
  is_default: boolean;

  @Column()
  location_area_encounters: string;

  @OneToMany(() => Move, (move) => move.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  moves: Relation<Move[]>;

  @Column()
  order: number;

  // @OneToMany(() => PastType, (past_type) => past_type.pokemon, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // past_types: Relation<PastType[]>;

  @Column(() => NameAndUrl)
  // all species arrays are of length one in our data
  species: NameAndUrl;

  @OneToMany(() => Sprite, (sprite) => sprite.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  sprites: Relation<Sprite[]>;

  @OneToMany(() => Stat, (stat) => stat.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  stats: Relation<Stat[]>;

  @OneToMany(() => Kind, (type) => type.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  types: Relation<Kind[]>;

  @Column()
  weight: number;
}

@Entity({ name: 'abilities' })
export class Ability extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  is_hidden: boolean;

  @Column()
  slot: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.abilities)
  @Index()
  pokemon: Relation<Pokemon>;
}

@Entity({ name: 'game_indices' })
export class GameIndex extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  value: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.game_indices)
  @Index()
  pokemon: Relation<Pokemon>;
}

@Entity({ name: 'version_details' })
export class ItemVersionDetails extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  rarity: number;

  @ManyToOne(() => Item, (item) => item.version_details)
  @Index()
  item?: Relation<Item>;
}

@Entity({ name: 'held_items' })
export class Item extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.held_items)
  @Index()
  pokemon: Relation<Pokemon>;

  @OneToMany(() => ItemVersionDetails, (details) => details.item, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  version_details: Relation<ItemVersionDetails[]>;
}

@Entity({ name: 'version_group_details' })
export class MoveVersionDetails {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  level_learned_at: number;

  @Column(() => NameAndUrl)
  move_learn_method: NameAndUrl;

  @Column(() => NameAndUrl)
  version_group: NameAndUrl;

  @ManyToOne(() => Move, (move) => move.version_group_details)
  @Index()
  move?: Relation<Move>;
}

@Entity({ name: 'moves' })
export class Move extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.moves)
  @Index()
  pokemon: Relation<Pokemon>;

  // optional so that we can save this last
  @OneToMany(() => MoveVersionDetails, (details) => details.move, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  version_group_details: Relation<MoveVersionDetails[]>;
}

export abstract class SpriteMap {
  @Column({ type: 'varchar' })
  front_default: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_female?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_shiny?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_shiny_female?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_default?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_female?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_shiny?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_shiny_female?: string;
}

@Entity({ name: 'sprites' })
export class Sprite extends SpriteMap {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  @Index()
  pokemon: Relation<Pokemon>;

  @Column({ type: 'varchar', nullable: true, default: null })
  title?: string;

  @Column({ nullable: true, default: false })
  is_other?: boolean;

  @Column({ nullable: true, default: false })
  is_animated?: boolean;

  @Column({ nullable: true, default: false })
  is_icons?: boolean;
}

@Entity({ name: 'types' })
export class Kind extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.types)
  @Index()
  pokemon: Relation<Pokemon>;

  @Column()
  slot: number;
}

@Entity({ name: 'stats' })
export class Stat extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  @Index()
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

// @Entity()
// export class PastType extends NameAndUrl {
//   @PrimaryGeneratedColumn()
//   id?: number;

//   @OneToMany(() => PastTypeKind, (type) => type.parent, {
//     cascade: true,
//     onDelete: 'CASCADE',
//   })
//   types: Relation<PastTypeKind[]>;

//   @ManyToOne(() => Pokemon, (pokemon) => pokemon.past_types)
//   @Index()
//   pokemon: Relation<Pokemon>;
// }

// @Entity()
// export class PastTypeKind extends NameAndUrl {
//   @PrimaryGeneratedColumn()
//   id?: number;

//   @ManyToOne(() => PastType, (past_type) => past_type.types)
//   @Index()
//   parent?: Relation<PastType>;

//   @Column()
//   slot: number;
// }
