import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { JsonPokemonDto } from './dto/json-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonsService } from './pokemons.service';

type ok = 'name-asc' | 'name-desc' | 'id-asc' | 'id-desc';

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
  findAll(@Req() req: Request): JsonPokemonDto[] {
    const sortQuery = req.query.sort;
    if (sortQuery && typeof sortQuery === string) {
      sortQuery;
    }
    return this.pokemonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pokemonsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonsService.update(+id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonsService.remove(+id);
  }
}
