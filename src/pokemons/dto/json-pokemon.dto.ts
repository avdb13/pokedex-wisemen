type NameAndUrl = {
  name: string;
  url: string;
};

type Ability = {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
};

type GameIndex = {
  game_index: number;
  version: NameAndUrl;
};

type Item = never;

type VersionGroupDetails = {
  level_learned_at: number;
  move_learn_method: NameAndUrl;
  version_group: NameAndUrl;
};

type Move = {
  move: NameAndUrl;
  version_group_details: Array<VersionGroupDetails>;
};

type PastTypes = {
  generation: NameAndUrl;
  types: Kind;
};

type SpriteMap = {
  back_default: string | null;
  back_female: string | null;
  back_shiny: string | null;
  back_shiny_female: string | null;
  front_default: string | null;
  front_female: string | null;
  front_shiny: string | null;
  front_shiny_female: string | null;
};

type Sprite = {
  other: Record<string, SpriteMap>;
  versions: Record<string, Record<string, SpriteMap>>;
} & SpriteMap;

type Stat = {
  base_stat: number;
  effort: number;
  stat: NameAndUrl;
}

type Kind = {
  slot: number;
  type: NameAndUrl;
}

export class JsonPokemonDto {
  abilities: Array<Ability>;
  base_experience: number;
  forms: Array<NameAndUrl>;
  game_indices: Array<GameIndex>;
  height: number;
  held_items: Array<Item>;
  id: number;
  is_default: boolean;
  location_area_encounters: string;
  moves: Array<Move>;
  name: string;
  order: number;
  past_types: Array<PastTypes>;
  species: NameAndUrl;
  sprites: Array<Sprite>;
  stats: Array<Stat>;
  types: Array<Kind>;
  weight: number;
}
