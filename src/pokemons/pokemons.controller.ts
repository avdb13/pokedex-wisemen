import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JsonPokemonDto } from './dto/json-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonsService } from './pokemons.service';
import {
  PokemonOptions,
  QueryGuard,
  RequestWithFindOptions,
  SearchOptions,
} from './pokemons.guard';

@Controller('/api/v1/pokemons')
@UseGuards(QueryGuard)
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(@Req() req: RequestWithFindOptions<PokemonOptions>) {
    const options = req.findOptions;

    // transform later
    return this.pokemonsService.findAll(options);
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
  ) {
    const pokemon = await this.pokemonsService.findOne(id);
    if (!pokemon) {
      throw new NotFoundException();
    }

    return pokemon;
  }

  @Post('json')
  importFromJson(@Body() body: JsonPokemonDto | Array<JsonPokemonDto>) {
    if (Array.isArray(body)) {
      this.pokemonsService.createMany(body);
    } else {
      this.pokemonsService.create(body);
    }
  }
}

@Controller('/api/v1/search')
@UseGuards(QueryGuard)
export class SearchController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(@Req() req: RequestWithFindOptions<PokemonOptions>) {
    const opts = req.findOptions;

    // !query ||
    // typeof query !== 'string' ||
    // query.length === 0 ||
    // (limitQuery &&
    //   (typeof limitQuery !== 'string' || limitQuery.length === 0))

    return this.pokemonsService.findAll(opts);
  }
}

@Controller('/api/v2/pokemons')
export class PokemonDetailsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(@Req() req: RequestWithFindOptions<SearchOptions>) {
    const opts = req.findOptions;

    return this.pokemonsService.findAll(opts);
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
  ) {
    const pokemon = await this.pokemonsService.findOne(id);
    if (!pokemon) {
      throw new NotFoundException();
    }

    const resp = pokemon.toSchema();
    if (!resp) {
      throw new InternalServerErrorException();
    }

    return resp;
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
