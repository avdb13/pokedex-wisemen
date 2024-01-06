// TODO: merge with GetPokemonDto
class GetPokemonDetailsDto {
  id: number;
  name: string;
  sprites: SpriteDto;
  types: Array<TypeDto>;
  height: number;
  weight: number;
  moves: Array<MoveDto>;
  order: number;
  species: string;
  stats: Array<StatDto>;
  abilities: Array<AbilityDto>;
  form: string;
}

// do we keep `string | undefined | null` here for correctness?
class SpriteDto {
  front_default?: string | null;
  front_female?: string | null;
  front_shiny?: string | null;
  front_shiny_female?: string | null;
  back_default?: string | null;
  back_female?: string | null;
  back_shiny?: string | null;
  back_shiny_female?: string | null;
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
  stat: string;
  base_stat: number;
  effort: number;
}

class MoveDetailsDto {
  move_learn_method: string;
  version_group: string;
  level_learned_at: number;
}

export default GetPokemonDetailsDto;
