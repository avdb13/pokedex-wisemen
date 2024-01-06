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
import GetPokemonDto from './dto/get-pokemon';

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
  findAll(@Req() req: Request) {
    const sortOptions = ['name-asc', 'name-desc', 'id-asc', 'id-desc'] as const;
    const sortQuery = req.query.sort;

    if (!sortQuery) {
      return this.pokemonsService.findAll();
    }

    if (
      sortQuery &&
      typeof sortQuery === 'string' &&
      sortQuery in sortOptions
    ) {
      const [sortBy, order] = sortQuery.split('-', 2);

      return this.pokemonsService.findAll(sortBy, order);
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
