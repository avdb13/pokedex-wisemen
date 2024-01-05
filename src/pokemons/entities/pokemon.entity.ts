import {
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

abstract class NameAndUrl<T extends string = string> {
  @Column()
  name: T;

  @Column()
  url: string;
}

@Entity()
export class VersionDetails extends NameAndUrl<Title> {}

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Ability, (ability) => ability.pokemon)
  abilities: Relation<Ability[]>;

  @Column()
  base_experience: number;

  @OneToMany(() => Form, (form) => form.pokemon)
  forms: Relation<Form[]>;

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

  @OneToOne(() => Species)
  @JoinColumn()
  species: Relation<Species>;

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
  @Column()
  is_hidden: boolean;

  @Column()
  slot: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.abilities)
  pokemon: Relation<Pokemon>;
}

@Entity()
export class Form extends NameAndUrl {
  @ManyToOne(() => Pokemon, (pokemon) => pokemon.forms)
  pokemon: Relation<Pokemon>;
}

@Entity()
export class GameIndex extends NameAndUrl {
  @Column()
  value: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.forms)
  pokemon: Relation<Pokemon>;
}

class ItemVersionDetails extends VersionDetails {
  @Column()
  rarity: number;

  @ManyToOne(() => Item, (item) => item.versionDetails)
  item: Relation<Item>;
}

@Entity()
export class Item extends NameAndUrl {
  @OneToMany(() => ItemVersionDetails, (details) => details.item)
  version_details: Relation<ItemVersionDetails[]>;
}

@Entity()
export class MoveVersionDetails extends VersionDetails {
  @Column()
  level_learned_at: number;

  @Column(() => NameAndUrl)
  move_learn_method: NameAndUrl;

  @Column(() => NameAndUrl)
  version_group: NameAndUrl;

  @ManyToOne(() => Move, (move) => move.versionDetails)
  move: Relation<Move>;
}

@Entity()
export class Move extends NameAndUrl {
  @OneToMany(() => MoveVersionDetails, (details) => details.move)
  version_group_details: Relation<MoveVersionDetails[]>;
}

@Entity()
export class PastType extends NameAndUrl {
  @OneToMany(() => PastType, (past_type) => past_type.types)
  types: Relation<PastTypeKind[]>;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.past_types)
  pokemon: Relation<Pokemon>;
}

@Entity()
export class PastTypeKind extends NameAndUrl {
  @ManyToOne(() => PastTypeKind, (kind) => kind.parent)
  parent: Relation<PastType>;

  @Column()
  slot: number;
}

@Entity()
export class Species extends NameAndUrl {}

abstract class AllowedSprites {
  @Column()
  front_default?: string;
  @Column()
  front_female?: string;
  @Column()
  front_shiny?: string;
  @Column()
  front_shiny_female?: string;
  @Column()
  back_default?: string;
  @Column()
  back_female?: string;
  @Column()
  back_shiny?: string;
  @Column()
  back_shiny_female?: string;
}

@Entity()
export class Sprite extends AllowedSprites {
  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  pokemon: Relation<Pokemon>;

  @Column()
  title?: Title;

  @Column()
  isOther: boolean = false;

  @Column()
  isAnimated: boolean = false;

  @Column()
  isIcons: boolean = false;
}

@Entity()
export class Kind extends NameAndUrl {
  @ManyToOne(() => Pokemon, (pokemon) => pokemon.types)
  pokemon: Relation<Pokemon>;

  @Column()
  slot: number;
}

@Entity()
export class Stat extends NameAndUrl {
  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  pokemon: Relation<Pokemon>;

  @Column()
  base: number;

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

export type Title =
  (typeof generationRecord)[keyof typeof generationRecord][number];
