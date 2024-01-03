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
  baseExperience: number;

  @OneToMany(() => Form, (form) => form.pokemon)
  forms: Form[];

  @OneToMany(() => GameIndex, (gameIndex) => gameIndex.pokemon)
  gameIndices: GameIndex[];

  @Column()
  height: number;

  // many-to-many since there's a finite number of items
  @ManyToMany(() => Item)
  @JoinTable()
  heldItems: Item[];

  @Column()
  isDefault: boolean;

  @Column()
  locationAreaEncounters: string;

  @ManyToMany(() => Move)
  @JoinTable()
  moves: Move[];

  @Column()
  order: number;

  @Column()
  pastTypes: never;

  @OneToOne(() => Species)
  @JoinColumn()
  species: Species;

  @OneToMany(() => Sprite, (sprite) => sprite.pokemon)
  sprites: Sprite[];

  @OneToMany()
  stats: Stat[];

  @Column()
  kind: Kind[];

  @Column()
  weight: number;
}

@Entity()
class Ability extends NameAndUrl {
  @Column()
  isHidden: boolean;

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
  versionDetails: ItemVersionDetails[];
}

@Entity()
class MoveVersionDetails extends VersionDetails {
  @Column()
  levelLearnedAt: number;

  @Column(() => NameAndUrl)
  moveLearnMethod: NameAndUrl;

  @Column(() => NameAndUrl)
  versionGroup: NameAndUrl;

  @ManyToOne(() => Move, (move) => move.versionDetails)
  move: Move;
}

@Entity()
class Move extends NameAndUrl {
  @OneToMany(() => MoveVersionDetails, (details) => details.move)
  versionDetails: MoveVersionDetails[];
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
class Sprite extends AllowedSprites {
  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  pokemon: Pokemon;

  @Column()
  target?: string;

  @Column()
  title: Title;

  @Column()
  animated: boolean;

  @Column()
  icons: boolean;
}

class Kind extends NameAndUrl {
  slot: number;
}

@Entity()
class Stat extends NameAndUrl {
  base: number;
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

type Title = (typeof generationRecord)[keyof typeof generationRecord][number];
