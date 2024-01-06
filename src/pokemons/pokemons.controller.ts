import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { JsonPokemonDto } from './dto/json-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonsService } from './pokemons.service';
import { FindOptionsOrderValue } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';

@Controller('/api/v1/pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Post()
  async create(@Body() pokemon: JsonPokemonDto) {
    // if (Array.isArray(pokemon)) {
    //   return;
    // }

    try {
      await this.pokemonsService.create(pokemon);
      console.log('success!');
    } catch (e) {
      console.log(e);
    }
  }

  @Get()
  async findAll(@Req() req: Request) {
    const sortBy = ['name', 'id'] as const;
    const sortOrder = ['asc', 'desc'] as const;

    type SortBy = (typeof sortBy)[number];
    type SortOrder = (typeof sortOrder)[number];

    const sortQuery = req.query.sort;

    if (sortQuery && typeof sortQuery === 'string') {
      const [prefix, suffix] = sortQuery.split('-', 2);

      if (!(prefix in sortBy && suffix in sortOrder)) {
        throw new BadRequestException();
      }

      return this.pokemonsService.findAll(
        prefix as SortBy,
        suffix as SortOrder,
      );
    }
    if (!sortQuery) {
      const pokemonArr = await this.pokemonsService.findAll();

      return pokemonArr.map((p) => p.toSchema());
    }

    throw new BadRequestException();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new BadRequestException();
    }

    const pokemon = await this.pokemonsService.findOne(numericId);
    if (!pokemon) {
      throw new NotFoundException();
    }

    const resp = pokemon.toSchema();
    if (!resp) {
      throw new InternalServerErrorException();
    }

    return resp;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonsService.update(+id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonsService.remove(+id);
  }

  @Delete()
  removeAll() {
    return this.pokemonsService.removeAll();
  }

  @Post('json')
  createFromJson(@Body() body: JsonPokemonDto | Array<JsonPokemonDto>) {
    if (Array.isArray(body)) {
      this.pokemonsService.createMany(body);
    } else {
      this.pokemonsService.create(body);
    }
  }
}

@Controller('/api/v1/search')
export class SearchController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const query = req.query.query;
    const limitQuery = req.query.limit;

    if (
      !query ||
      typeof query !== 'string' ||
      query.length === 0 ||
      (limitQuery &&
        (typeof limitQuery !== 'string' || limitQuery.length === 0))
    ) {
      throw new BadRequestException();
    }

    const limit = limitQuery ? parseInt(limitQuery) : undefined;
    if (limit && isNaN(limit)) {
      throw new BadRequestException();
    }

    return this.pokemonsService.findAll({ limit, query });
  }
}

// useless, we need to define each switch separately anyway
// type SortBy = keyof Pokemon extends infer K extends number | string ? K : never;

export type SortOptions = {
  // sortBy: SortBy;
  sortBy?: string;
  // do we want this or our own union?
  order?: FindOptionsOrderValue;
};
export type SearchOptions = {
  query: string;
  limit?: number;
};

export type FindOptions = SortOptions | SearchOptions;
