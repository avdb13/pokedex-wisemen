class GetPokemonDto {
  id: number;
  name: string;
  sprites: SpriteDto;
  types: Array<TypesDto>;
}

class SpriteDto {
  front_default: string;
}

class TypesDto {
  type: { name: string };
  slot: number;
}

export default GetPokemonDto;
