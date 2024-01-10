import { Pokemon } from '../entities/pokemon.entity';

export class GetPokemonDto {
  id: number;
  name: string;
  sprites: SpriteDto;
  types: Array<TypeDto>;
}

export class GetPokemonDetailsDto extends GetPokemonDto {
  height: number;
  weight: number;
  moves: Array<MoveDto>;
  order: number;
  species: string;
  stats: Array<StatDto>;
  abilities: Array<AbilityDto>;
  form: string;
}

export type MaybeArray<T> = T | T[];

// can be made generic
class Page<T> {
  data: T;
  metadata?: MetaData;
}

export class PokemonPage extends Page<Pokemon[]> {}
export class GetPokemonPageDto extends Page<GetPokemonDto[]> {}

export class MetaData {
  next?: string;
  previous?: string;
  total: number;
  pages: number;
  page: number;
}

export class MetaDataDto {
  next?: string;
  previous?: string;
  total: number;
  pages: number;
  page: number;
}

class SpriteDto {
  front_default: string;
  front_female?: string;
  front_shiny?: string;
  front_shiny_female?: string;
  back_default?: string;
  back_female?: string;
  back_shiny?: string;
  back_shiny_female?: string;
}

class TypeDto {
  type: { name: string };
  slot: number;
}

class MoveDto {
  move: string;
  version_group_details: Array<MoveDetailsDto>;
}

class StatDto {
  stat: string;
  base_stat: number;
  effort: number;
}

class AbilityDto {
  ability: string;
  is_hidden: boolean;
  slot: number;
}

class MoveDetailsDto {
  move_learn_method: string;
  version_group: string;
  level_learned_at: number;
}
