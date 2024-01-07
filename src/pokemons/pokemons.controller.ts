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
import { PaginationOptions, RequestWithFindOptions } from './pokemons.guard';

const sortByOptions = ['name', 'id'] as const;
const orderOptions = ['asc', 'desc'] as const;

@Controller('/api/v1/pokemons')
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const { sort } = req.query;

    if (sort && typeof sort === 'string') {
      const [sortBy, order] = sort.split('-', 2);

      if (!(sortBy in sortByOptions && order in orderOptions)) {
        throw new BadRequestException();
      }

      return this.pokemonsService.findAll({ sortBy, order });
    }

    if (!sort) {
      const pokemonArr = await this.pokemonsService.findAll();

      return pokemonArr.map((p) => p.toSchema());
    }

    throw new BadRequestException();
  }

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

@Controller('/api/v2/pokemons')
export class PokemonDetailsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(@Req() req: RequestWithFindOptions) {
    const opts = req.findOptions as PaginationOptions | undefined;

    if (opts) {
      const pokemonArr = await this.pokemonsService.findAll();

      return pokemonArr.map((p) => p.toSchema());
    }

    return this.pokemonsService.findAll(opts);
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
