import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GetPokemonDetailsDto, GetPokemonDto } from './dto/get-pokemon';
import { Pokemon, Sprite, SpriteMap } from './entities/pokemon.entity';

export const isBaseSprite = (s: Sprite) =>
  !s.is_other && !s.is_animated && !s.is_icons && !s.title;

type MaybeArray<T> = T | T[];

export const toPokemonDetails = (pokemon: Pokemon): GetPokemonDetailsDto => {
  const {
    id,
    form: { name },
    sprites: tooManySprites,
    types,
    height,
    weight,
    moves,
    order,
    species,
    stats,
    abilities,
  } = pokemon;

  const sprite = tooManySprites.find(isBaseSprite);

  if (!sprite) {
    throw new InternalServerErrorException();
  }

  const sprites: SpriteMap = Object.keys(sprite).reduce(
    (init, k, i) =>
      k in SpriteMap ? { ...init, [k]: Object.values(sprite)[i] } : init,
    {} as SpriteMap,
  );

  const ok = {
    id,
    name,
    sprites,
    types: types.map(({ slot, name }) => ({
      slot,
      type: { name },
    })),
    height,
    weight,
    moves: moves.map(({ name, version_group_details }) => ({
      move: name,
      version_group_details: version_group_details.map(
        ({ level_learned_at, version_group, move_learn_method }) => ({
          level_learned_at,
          version_group: version_group.name,
          move_learn_method: move_learn_method.name,
        }),
      ),
    })),
    order,
    species: species.name,
    // test whether it returns only the fields we want
    stats: stats.map(({ base_stat, name, effort }) => ({
      base_stat,
      stat: name,
      effort,
    })),
    abilities: abilities.map(({ name, is_hidden, slot }) => ({
      ability: name,
      is_hidden,
      slot,
    })),
    form: name,
  } as GetPokemonDetailsDto;

  return ok;
};
export const toPokemon = (pokemon: Pokemon): GetPokemonDto => {
  const {
    id,
    form: { name },
    sprites: tooManySprites,
    types,
  } = pokemon;

  const sprite = tooManySprites.find(isBaseSprite);

  if (!sprite) {
    throw new InternalServerErrorException();
  }

  const sprites = { front_default: sprite.front_default };

  // id is only `number | undefined` so that we can construct the entity without a database ID
  return {
    id: id ?? 1,
    name,
    sprites,
    types: types.map(({ slot, name }) => ({
      slot,
      type: { name },
    })),
  };
};

export class PokemonInterceptor
  implements NestInterceptor<MaybeArray<Pokemon>, MaybeArray<GetPokemonDto>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<MaybeArray<Pokemon>>,
  ): Observable<MaybeArray<GetPokemonDto>> {
    return next.handle().pipe(
      map((pokemon) => {
        if (Array.isArray(pokemon)) {
          return pokemon.map((p) => toPokemon(p));
        }

        return toPokemon(pokemon);
      }),
    );
  }
}

@Injectable()
export class PokemonDetailsInterceptor
  implements
    NestInterceptor<MaybeArray<Pokemon>, MaybeArray<GetPokemonDetailsDto>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<MaybeArray<Pokemon>>,
  ): Observable<MaybeArray<GetPokemonDetailsDto>> {
    return next.handle().pipe(
      map((pokemon) => {
        if (Array.isArray(pokemon)) {
          return pokemon.map((p) => toPokemonDetails(p));
        }

        return toPokemonDetails(pokemon);
      }),
    );
  }
}
