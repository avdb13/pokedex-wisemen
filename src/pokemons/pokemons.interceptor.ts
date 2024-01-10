import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GetPokemonDetailsDto,
  GetPokemonDto,
  GetPokemonPageDto,
  PokemonPage,
} from './dto/get-pokemon';
import { Pokemon, Sprite, SpriteMap } from './entities/pokemon.entity';

export const isBaseSprite = (s: Sprite) =>
  !s.is_other && !s.is_animated && !s.is_icons && !s.title;

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
  implements NestInterceptor<Pokemon, GetPokemonDto>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Pokemon>,
  ): Observable<GetPokemonDto> {
    return next.handle().pipe(map(toPokemon));
  }
}

@Injectable()
export class PokemonDetailsInterceptor
  implements NestInterceptor<Pokemon, GetPokemonDetailsDto>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Pokemon>,
  ): Observable<GetPokemonDetailsDto> {
    return next.handle().pipe(
      map((pokemon) => {
        return toPokemonDetails(pokemon);
      }),
    );
  }
}

@Injectable()
export class PageInterceptor
  implements NestInterceptor<PokemonPage, GetPokemonPageDto>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<PokemonPage>,
  ): Observable<GetPokemonPageDto> {
    return next.handle().pipe(
      map(({ data: pokemon, metadata }) => {
        return {
          data: pokemon.map((p) => toPokemon(p)),
          metadata,
        };
      }),
    );
  }
}
