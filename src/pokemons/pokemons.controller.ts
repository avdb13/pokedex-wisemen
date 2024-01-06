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
    const sortOptions = ['name-asc', 'name-desc', 'id-asc', 'id-desc'] as const;
    const sortQuery = req.query.sort;

    if (
      sortQuery &&
      typeof sortQuery === 'string' &&
      sortQuery in sortOptions
    ) {
      const [sortBy, order] = sortQuery.split('-', 2);

      return this.pokemonsService.findAll(sortBy, order);
    }

    return this.pokemonsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const resp = await this.pokemonsService.findOne(+id);
    console.log(resp);
    return resp;
  }
  // Pokemon:
  // type: object
  // properties:
  //   id:
  //     type: integer
  //   name:
  //     type: string
  //   sprites:
  //     type: object
  //     properties:
  //       front_default:
  //         type: string
  //   types:
  //     type: array
  //     items:
  //       type: object
  //       properties:
  //         type:
  //           type: object
  //           properties:
  //             name:
  //               type: string
  //         slot:
  //           type: number

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
