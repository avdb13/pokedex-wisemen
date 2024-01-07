import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GetPokemonDto } from './dto/get-pokemon';
import { Pokemon, Sprite } from './entities/pokemon.entity';

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
        const {
          id,
          form: { name },
          sprites: extendedSprites,
          types: extendedTypes,
        } = pokemon;

        const sprite = extendedSprites.find(isBaseSprite);

        if (!sprite || !sprite.front_default) {
          throw new InternalServerErrorException();
        }

        const sprites = { front_default: sprite.front_default };

        const types = extendedTypes.map(({ slot, name }) => ({
          slot,
          type: { name },
        }));

        return { id, name, sprites, types } as GetPokemonDto;
      }),
    );
  }
}
