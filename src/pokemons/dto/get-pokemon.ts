class GetPokemonDto {
  id: number;
  name: string;
  sprites: SpriteDto;
  types: Array<TypeDto>;
}

class GetPokemonDetailsDto extends GetPokemonDto {
  height: number;
  weight: number;
  moves: Array<MoveDto>;
  order: number;
  species: string;
  stats: Array<StatDto>;
  abilities: Array<AbilityDto>;
  form: string;
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
  stat: string;
  base_stat: number;
  effort: number;
}

class MoveDetailsDto {
  move_learn_method: string;
  version_group: string;
  level_learned_at: number;
}

export { GetPokemonDto, GetPokemonDetailsDto };
