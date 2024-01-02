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
  versions: Version[];
  stats: Stat[];
  kind: Kind[];
  weight: number;
}

type Kind = {
  slot: number;
} & NameAndUrl;

type Stat = {
  base: number;
  effort: number;
} & NameAndUrl;

type SpriteByGeneration = {
  front_default: string | null;
  front_female: string | null;
  front_shiny: string | null;
  front_shiny_female: string | null;
};

type GenerationOne = 'red-blue' | 'yellow';
type GenerationTwo = 'crystal' | 'gold' | 'silver';
type GenerationThree = 'emerald' | 'firered-leafgreen' | 'ruby-sapphire';
type GenerationFour = 'diamond-pearl' | 'heartgold-soulsilver' | 'platinum';
type GenerationFive = 'black-white';
// icons
type GenerationSix = 'omegaruby-alphasapphire' | 'x-y';
// icons
type GenerationSeven = 'ultra-sun-ultra-moon';
type GenerationEight = never;

// check later whether we want a Record or sum type
//
// "back_default"
// "back_female"
// "back_shiny"
// "back_shiny_female"
// "front_default"
// "front_female"
// "front_shiny"
// "front_shiny_female"
//  "other": {
// "dream_world": {
//     "front_default"
//     "front_female"
// },
// "home": {
//     "front_default"
//     "front_female"
//     "front_shiny"
//     "front_shiny_female"
// },
// "official-artwork": {
//     "front_default"
// }
// }
type Sprite = string | null;

type NameAndUrl = {
  name: string;
  url: string;
};

type Move = {
  versionGroupDetails: VersionGroupDetails;
} & NameAndUrl;

type VersionGroupDetails = {
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

type GameVersion = never;

class GameIndex {
  value: 153;
  version: NameAndUrl;
}

type Ability = {
  isHidden: boolean;
  slot: number;
} & NameAndUrl;
