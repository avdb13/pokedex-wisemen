import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Item, Move, Pokemon, Sprite } from '../entities/pokemon.entity';

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

type ItemVersionDetails = {
  rarity: number;
  version: NameAndUrl;
};

type Item = {
  item: NameAndUrl;
  version_details: Array<ItemVersionDetails>;
};

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
  types: Kind[];
};

type SpriteMap = {
  front_default: string;
  front_female?: string | null;
  front_shiny?: string | null;
  front_shiny_female?: string | null;
  back_default?: string | null;
  back_female?: string | null;
  back_shiny?: string | null;
  back_shiny_female?: string | null;
};

// this is for cleaning up SpriteMap
export type NoNull<T> = {
  [P in keyof T]: Exclude<T[P], null>;
};

type Sprites = {
  other: Record<string, SpriteMap>;
  versions: Record<
    string,
    Record<string, SpriteMap & { animated?: SpriteMap | null }>
  >;
} & SpriteMap;

type Stat = {
  base_stat: number;
  effort: number;
  stat: NameAndUrl;
};

type Kind = {
  slot: number;
  type: NameAndUrl;
};

export class CreatePokemonDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  abilities: Array<Ability>;

  @IsNotEmpty()
  base_experience: number;

  @IsNotEmpty()
  forms: Array<NameAndUrl>;

  @IsNotEmpty()
  game_indices: Array<GameIndex>;

  @IsNotEmpty()
  height: number;

  @IsNotEmpty()
  held_items: Array<Item>;

  @IsNotEmpty()
  is_default: boolean;

  @IsNotEmpty()
  location_area_encounters: string;

  @IsNotEmpty()
  moves: Array<Move>;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  order: number;

  @IsNotEmpty()
  past_types: Array<PastTypes>;

  @IsNotEmpty()
  species: NameAndUrl;

  @IsNotEmpty()
  sprites: Sprites;

  @IsNotEmpty()
  stats: Array<Stat>;

  @IsNotEmpty()
  types: Array<Kind>;

  @IsNotEmpty()
  weight: number;
}

export { Ability as CreateAbilityDto };
