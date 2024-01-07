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

const isBaseSprite = (s: Sprite) =>
  !s.is_other && !s.is_animated && !s.is_icons && !s.title;

@Injectable()
export class PokemonInterceptor
  implements NestInterceptor<Pokemon, GetPokemonDto>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<Pokemon>,
  ): Observable<GetPokemonDto> {
    return next.handle().pipe(
      map((pokemon) => {
        console.log(pokemon.id);
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

        return {
          id,
          name,
          sprites,
          types: types.map(({ slot, name }) => ({
            slot,
            type: { name },
          })),
        } as GetPokemonDto;
      }),
    );
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
        console.log(pokemon.id);
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

        console.log(pokemon);
        const sprite = tooManySprites.find(isBaseSprite);

        if (!sprite) {
          throw new InternalServerErrorException();
        }

        const sprites: SpriteMap = { ...(sprite as SpriteMap) };

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
      }),
    );
  }
}
