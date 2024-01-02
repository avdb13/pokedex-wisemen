export class Pokemon {
  abilities: Ability[];
  baseExperience: number;
  forms: NameAndUrl[];
  gameIndices: GameIndex[];
  height: number;
  heldItems: Item[];
  id: number;
  isDefault: boolean;
  locationAreaEncounters: string;
  moves: Move[];
  order: number;
  pastTypes: never;
  species: NameAndUrl[];
  sprites: Sprite[];
  spriteVersions: Record<number, Record<Title, Sprite>>;
  stats: Stat[];
  kind: Kind[];
  weight: number;
}

type NameAndUrl = {
  name: string;
  url: string;
};

type Ability = {
  isHidden: boolean;
  slot: number;
} & NameAndUrl;

type Kind = {
  slot: number;
} & NameAndUrl;

type Stat = {
  base: number;
  effort: number;
} & NameAndUrl;

type SpriteMap = {
  front_default?: string;
  front_female?: string;
  front_shiny?: string;
  front_shiny_female?: string;
  back_default?: string;
  back_female?: string;
  back_shiny?: string;
  back_shiny_female?: string;
};

type Sprite = {
  basic: SpriteMap;
  other: Record<string, SpriteMap>;
  icons: SpriteMap;
};

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

type Move = {
  versionGroupDetails: MoveVersionDetails;
} & NameAndUrl;

type MoveVersionDetails = {
  levelLearnedAt: number;
  moveLearnMethod: NameAndUrl[];
  versionGroup: NameAndUrl[];
};

type Item = {
  versionDetails: VersionDetails;
} & NameAndUrl;

type VersionDetails = {
  rarity: number;
  version: NameAndUrl;
};

class GameIndex {
  value: 153;
  version: NameAndUrl;
}
