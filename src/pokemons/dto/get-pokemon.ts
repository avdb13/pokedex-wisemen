class PokemonDto {
  id: number;
  name: string;
  sprites: SpriteDto;
  types: Array<TypesDto>;
}

class SpriteDto {
  front_default: string;
  types: Array<SpriteDto>;
}

class TypesDto {
  type: { name: string };
  slot: number;
}

export default PokemonDto;
