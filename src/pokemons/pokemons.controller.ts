import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { PokemonsService } from './pokemons.service';
import {
  PokemonsGuard,
  RequestWithFindOptions,
  SearchGuard,
} from './pokemons.guard';
import {
  PokemonDetailsInterceptor,
  PokemonInterceptor,
} from './pokemons.interceptor';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

@Controller('/api/v1/pokemons')
@UseGuards(PokemonsGuard)
export class PokemonsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  @UseInterceptors(PokemonInterceptor)
  async findAll(@Req() req: RequestWithFindOptions) {
    const options = req.findOptions;

    return this.pokemonsService.findAll(options);
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
    if (id < 1) {
      throw new NotFoundException();
    }

    const pokemon = await this.pokemonsService.findOne(id);

    if (!pokemon) {
      throw new NotFoundException();
    }

    return pokemon;
  }

  @Post()
  // this returns circular JSON, drop the return value!
  async importFromJson(
    @Body() body: CreatePokemonDto | Array<CreatePokemonDto>,
  ) {
    Array.isArray(body)
      ? this.pokemonsService.createMany(body)
      : this.pokemonsService.create(body);
  }

  @Delete()
  @HttpCode(204)
  removeAll() {
    return this.pokemonsService.removeAll();
  }
}

@Controller('/api/v1/search')
@UseGuards(SearchGuard)
export class SearchController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  async findAll(@Req() req: RequestWithFindOptions) {
    const opts = req.findOptions;

    return this.pokemonsService.findAll(opts);
  }
}

@Controller('/api/v2/pokemons')
@UseGuards(PokemonsGuard)
export class PokemonDetailsController {
  constructor(private readonly pokemonsService: PokemonsService) {}

  @Get()
  @UseInterceptors(PokemonInterceptor)
  async findAll(@Req() req: RequestWithFindOptions) {
    const opts = req.findOptions;

    return this.pokemonsService.findAll(opts);
  }
}
