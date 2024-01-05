import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { pokemons } from './../pokemons';
import { JsonPokemonDto } from './dto/json-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Kind, Pokemon, Sprite, Stat } from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(Pokemon) private pokemonRepository: Repository<Pokemon>,
  ) {}

  create(pokemonDto: JsonPokemonDto) {
    const abilities = pokemonDto.abilities.map(
      ({ ability, is_hidden, slot }) => ({
        ...ability,
        slot,
        is_hidden,
        pokemon,
      }),
    );
    const forms = pokemonDto.forms.map((form) => ({
      ...form,
      pokemon,
    }));

    const game_indices = pokemonDto.game_indices.map(
      ({ version, game_index }) => ({
        ...version,
        value: game_index,
        pokemon,
      }),
    );

    const held_items = pokemonDto.held_items.map(
      ({ item, version_details }) => ({
        ...item,
        version_details: version_details.map(({ rarity, version }) => ({
          ...version,
          rarity,
        })),
        pokemon,
      }),
    );

    const moves = pokemonDto.moves.map(({ move, version_group_details }) => ({
      ...move,
      version_group_details: version_group_details.map(
        ({ level_learned_at, move_learn_method, version_group }) => ({
          level_learned_at,
          ...move_learn_method,
          ...version_group /*move ?*/,
        }),
      ),
      pokemon,
    }));

    const { other, versions, ...baseSprites } = pokemonDto.sprites;

    const spritesByVersion: Array<Sprite> = Object.entries(versions).map(
      ([_generation, sprites]) =>
        Object.entries(sprites).map(([title, spriteMap]) => ({
          ...spriteMap,
          title: title in Title ? title : undefined,
          isIcons: title === 'icons',
        })),
    );

    const otherSprites: Array<Sprite> = Object.entries(other).map(
      ([_generation, spriteMap]) => ({
        ...spriteMap,
        isOther: true,
      }),
    );

    const sprites = [
      { ...baseSprites, pokemon } as Sprite,
      ...spritesByVersion,
      ...otherSprites,
    ];

    const stats: Array<Stat> = pokemonDto.stats.map(
      ({ stat, effort, base_stat }) => ({
        ...stat,
        effort,
        base_stat,
        pokemon,
      }),
    );

    const types: Array<Kind> = pokemonDto.types.map(({ slot, type }) => ({
      ...type,
      slot,
      pokemon,
    }));

    const {
      id,
      base_experience,
      height,
      is_default,
      location_area_encounters,
      order,
      species,
      weight,
    } = pokemonDto;

    const partial: Partial<Pokemon> = {
      id,
      base_experience,
      height,
      is_default,
      location_area_encounters,
      order,
      species,
      weight,
    };

    this.pokemonRepository.save({
      ...partial,
      abilities,
      forms,
      game_indices,
      held_items,
      moves,
      sprites,
      stats,
      types,
    });
  }

  findAll(): JsonPokemonDto[] {
    return pokemons;
  }

  findOne(id: number) {
    return `This action returns a #${id} pokemon`;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }

  loadFromJson() {
    pokemons;
  }
}
