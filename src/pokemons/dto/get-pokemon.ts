class GetPokemonDto {
  id: number;
  name: string;
  sprites: SpriteDto;
  types: Array<TypeDto>;
}

class SpriteDto {
  front_default: string;
}

class TypeDto {
  type: { name: string };
  slot: number;
}

export default GetPokemonDto;
