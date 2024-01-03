import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

abstract class NameAndUrl<T extends string = string> {
  name: T;
  url: string;
}

@Entity()
export class VersionDetails extends NameAndUrl<Title> {}

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany()
  abilities: Ability[];

  @Column()
  baseExperience: number;

  @Column()
  forms: NameAndUrl[];

  @Column()
  gameIndices: GameIndex[];

  @Column()
  height: number;

  // many-to-many since there's a finite number of items
  @ManyToMany()
  heldItems: Item[];

  @Column()
  isDefault: boolean;

  @Column()
  locationAreaEncounters: string;

  @ManyToMany()
  moves: Move[];

  @Column()
  order: number;

  @Column()
  pastTypes: never;

  @OneToOne()
  species: Species;

  @OneToMany()
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
  isHidden: boolean;
  slot: number;
}

@Entity()
export class Forms extends NameAndUrl {}

@Entity()
class GameIndex extends NameAndUrl {
  @Column()
  value: number;
}

class ItemVersionDetails extends VersionDetails {
  rarity: number;
}

class Item extends NameAndUrl {
  versionDetails: ItemVersionDetails[];
}

class MoveVersionDetails extends VersionDetails {
  levelLearnedAt: number;
  moveLearnMethod: NameAndUrl[];
  versionGroup: NameAndUrl[];
}

@Entity()
class Move extends NameAndUrl {
  @OneToMany()
  versionDetails: MoveVersionDetails[];
}

@Entity()
class Species extends NameAndUrl {}

abstract class AllowedSprites {
  front_default?: string;
  front_female?: string;
  front_shiny?: string;
  front_shiny_female?: string;
  back_default?: string;
  back_female?: string;
  back_shiny?: string;
  back_shiny_female?: string;
}

@Entity()
class Sprite extends AllowedSprites {
  target?: string;
  title: Title;
  animated: boolean;
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
