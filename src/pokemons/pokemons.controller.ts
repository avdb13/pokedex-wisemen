import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';

import { PokemonsService } from './pokemons.service';
import {
  PageInterceptor,
  PokemonDetailsInterceptor,
  PokemonInterceptor,
} from './pokemons.interceptor';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { Request } from 'express';
import { FindOptionsDto, PokemonOptionsDto } from './dto/find-options.dto';
import { PAGE_SIZE } from './pokemons.constant';

@Controller('/api/v1/pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  @UseInterceptors(PokemonInterceptor)
  async findAll(
    @Query(new ValidationPipe({ transform: true })) options: FindOptionsDto,
  ) {
    const { data } = await this.pokemonsService.findAll(options);

    return data;
  }

  @Get(':id')
  @UseInterceptors(PokemonDetailsInterceptor)
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
  ) {
    const pokemon = await this.pokemonsService.findOne(Math.abs(id));

    if (!pokemon) {
      throw new NotFoundException();
    }

    return pokemon;
  }

  @Post()
  async importFromJson(
    @Body()
    body: CreatePokemonDto | Array<CreatePokemonDto>,
  ) {
    return Array.isArray(body)
      ? await this.pokemonsService.createMany(body)
      : await this.pokemonsService.create(body);
  }
}

@Controller('/api/v1/search')
export class SearchController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) options: FindOptionsDto,
  ) {
    const { data } = await this.pokemonsService.findAll(options);

    return data;
  }
}

@Controller('/api/v2/pokemons')
export class PokemonDetailsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  @UseInterceptors(PageInterceptor)
  async findAll(
    @Query(new ValidationPipe({ transform: true })) options: PokemonOptionsDto,
    @Req() req: Request,
  ) {
    const { data, metadata } = await this.pokemonsService.findAll(
      options,
      true,
    );

    const next = new URL(
      req.originalUrl,
      req.protocol + '://' + req.get('host'),
    );
    const previous = Object.assign(next);

    if (options.sort) {
      const [sortBy, order] = options.sort.split('-', 2)!;
      next.searchParams.set('sort', `${sortBy}-${order}`);
    }

    if (options.limit && options.limit > 0) {
      next.searchParams.set('limit', options.limit.toString());
    }

    if (options.offset && options.offset > 0) {
      next.searchParams.set(
        'offset',
        (metadata!.total !== 0
          ? (options.offset + PAGE_SIZE) % metadata!.total
          : 0
        ).toString(),
      );
      previous.searchParams.set(
        'offset',
        (metadata!.total !== 0
          ? (options.offset - PAGE_SIZE) % metadata!.total
          : 0
        ).toString(),
      );
    }

    return {
      data,
      metadata: {
        ...metadata,
        next,
        previous,
      },
    };
  }
}
