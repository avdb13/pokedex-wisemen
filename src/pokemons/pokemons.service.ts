import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsOrderValue, Repository } from 'typeorm';
import { pokemons } from './../pokemons';
import { JsonPokemonDto } from './dto/json-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import {
  Item,
  Kind,
  Move,
  Pokemon,
  Sprite,
  Stat,
  titles,
} from './entities/pokemon.entity';

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(Pokemon) private pokemonRepository: Repository<Pokemon>,
  ) {}

  async create(pokemonDto: JsonPokemonDto) {
    const pokemon = new Pokemon();

    const abilities = pokemonDto.abilities.map(
      ({ ability, is_hidden, slot }) => ({
        ...ability,
        slot,
        is_hidden,
        pokemon,
      }),
    );
    pokemon.abilities = abilities;

    const forms = pokemonDto.forms.map((form) => ({
      ...form,
      pokemon,
    }));
    pokemon.forms = forms;

    const game_indices = pokemonDto.game_indices.map(
      ({ version, game_index }) => ({
        ...version,
        value: game_index,
        pokemon,
      }),
    );
    pokemon.game_indices = game_indices;

    const held_items = pokemonDto.held_items.map(
      ({ item: rest, version_details }) => {
        let item = new Item();

        item = {
          ...rest,
          pokemon,
          version_details: version_details.map(({ rarity, version }) => ({
            ...version,
            rarity,
            item,
          })),
        };

        return item;
      },
    );
    pokemon.held_items = held_items;

    const moves = pokemonDto.moves.map(
      ({ move: rest, version_group_details }) => {
        let move = new Move();

        move = {
          ...rest,
          pokemon,
          version_group_details: version_group_details.map((details) => ({
            ...details,
            move,
          })),
        };

        return move;
      },
    );
    pokemon.moves = moves;

    const { other, versions, ...baseSprites } = pokemonDto.sprites;

    const spritesByVersion: Array<Sprite> = Object.entries(versions).flatMap(
      ([_generation, sprites]) =>
        Object.entries(sprites).flatMap(([title, spriteMap]) =>
          spriteMap.animated
            ? [
                {
                  ...spriteMap,
                  pokemon,
                  title: title in titles ? title : null,
                  is_icons: title === 'icons',
                },
                {
                  ...spriteMap.animated,
                  is_animated: true,
                  pokemon,
                  title: title in titles ? title : null,
                },
              ]
            : [
                {
                  ...spriteMap,
                  pokemon,
                  title: title in titles ? title : null,
                  is_icons: title === 'icons',
                },
              ],
        ),
    );

    const otherSprites: Array<Sprite> = Object.entries(other).map(
      ([_generation, spriteMap]) => ({
        ...spriteMap,
        pokemon,
        isOther: true,
      }),
    );

    const sprites = [
      { ...baseSprites, pokemon } as Sprite,
      ...spritesByVersion,
      ...otherSprites,
    ];
    pokemon.sprites = sprites;

    const stats: Array<Stat> = pokemonDto.stats.map(
      ({ stat, effort, base_stat }) => ({
        ...stat,
        effort,
        base_stat,
        pokemon,
      }),
    );
    pokemon.stats = stats;

    const types: Array<Kind> = pokemonDto.types.map(({ slot, type }) => ({
      ...type,
      slot,
      pokemon,
    }));
    pokemon.types = types;

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

    pokemon.id = id;
    pokemon.base_experience = base_experience;
    pokemon.height = height;
    pokemon.is_default = is_default;
    pokemon.location_area_encounters = location_area_encounters;
    pokemon.order = order;
    pokemon.species = species;
    pokemon.weight = weight;

    return this.pokemonRepository.save(pokemon);
  }

  findAll(
    sortBy?: 'name' | 'id' = 'id',
    // can be undefined to we make it optional here too
    order?: FindOptionsOrderValue,
  ): JsonPokemonDto[] {
    switch (sortBy) {
      case 'name':
        return this.pokemonRepository.find({
          order: { form: { name: order } },
        });
      case 'id':
        // defaults to ID?
        return this.pokemonRepository.find({
          // order: { form: { name: order } },
        });
      default:
        throw Error(`unimplemented`);
    }
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
