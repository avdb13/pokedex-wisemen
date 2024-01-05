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
  abilities: Ability[];

  @Column()
  base_experience: number;

  @OneToMany(() => Form, (form) => form.pokemon)
  forms: Form[];

  @OneToMany(() => GameIndex, (gameIndex) => gameIndex.pokemon)
  game_indices: GameIndex[];

  @Column()
  height: number;

  // many-to-many since there's a finite number of items
  @ManyToMany(() => Item)
  @JoinTable()
  held_items: Item[];

  @Column()
  is_default: boolean;

  @Column()
  location_area_encounters: string;

  @ManyToMany(() => Move)
  @JoinTable()
  moves: Move[];

  @Column()
  order: number;

  @Column()
  pastTypes: PastType[];

  @OneToOne(() => Species)
  @JoinColumn()
  species: Species;

  @OneToMany(() => Sprite, (sprite) => sprite.pokemon)
  sprites: Sprite[];

  @OneToMany(() => Stat, (stat) => stat.pokemon)
  stats: Stat[];

  @OneToMany(() => Kind, (kind) => kind.pokemon)
  types: Kind[];

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
  pokemon: Pokemon;
}

@Entity()
export class Form extends NameAndUrl {
  @ManyToOne(() => Pokemon, (pokemon) => pokemon.forms)
  pokemon: Pokemon;
}

@Entity()
class GameIndex extends NameAndUrl {
  @Column()
  value: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.forms)
  pokemon: Pokemon;
}

class ItemVersionDetails extends VersionDetails {
  @Column()
  rarity: number;

  @ManyToOne(() => Item, (item) => item.versionDetails)
  item: Item;
}

@Entity()
class Item extends NameAndUrl {
  @OneToMany(() => ItemVersionDetails, (details) => details.item)
  version_details: ItemVersionDetails[];
}

@Entity()
class MoveVersionDetails extends VersionDetails {
  @Column()
  level_learned_at: number;

  @Column(() => NameAndUrl)
  move_learn_method: NameAndUrl;

  @Column(() => NameAndUrl)
  version_group: NameAndUrl;

  @ManyToOne(() => Move, (move) => move.versionDetails)
  move: Move;
}

@Entity()
class Move extends NameAndUrl {
  @OneToMany(() => MoveVersionDetails, (details) => details.move)
  version_group_details: MoveVersionDetails[];
}

@Entity()
class PastType extends NameAndUrl {
  @OneToMany(() => PastType, (past_type) => past_type.types)
  types: PastTypeKind[];
}

@Entity()
class PastTypeKind extends NameAndUrl {
  @ManyToOne(() => PastTypeKind, (kind) => kind.parent)
  parent: PastType;

  @Column()
  slot: number;
}

@Entity()
class Species extends NameAndUrl {}

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
  pokemon: Pokemon;

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
  pokemon: Pokemon;

  @Column()
  slot: number;
}

@Entity()
export class Stat extends NameAndUrl {
  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  pokemon: Pokemon;

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
