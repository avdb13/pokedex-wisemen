import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { SortOptions } from './pokemons.controller';
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
import { FindOptions } from './pokemons.controller';

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(Pokemon) private pokemonsRepository: Repository<Pokemon>,
  ) {}

  toEntity(pokemonDto: JsonPokemonDto) {
    const pokemon = this.pokemonsRepository.create();

    const {
      base_experience,
      height,
      is_default,
      location_area_encounters,
      order,
      species,
      weight,
    } = pokemonDto;

    pokemon.base_experience = base_experience;
    pokemon.height = height;
    pokemon.is_default = is_default;
    pokemon.location_area_encounters = location_area_encounters;
    pokemon.order = order;
    pokemon.species = species;
    pokemon.weight = weight;
    pokemon.form = pokemonDto.forms[0];

    return pokemon;
  }

  addRelations(pokemonDto: JsonPokemonDto, pokemon: Pokemon) {
    const abilities = pokemonDto.abilities.map(
      ({ ability, is_hidden, slot }) => ({
        ...ability,
        slot,
        is_hidden,
        pokemon,
      }),
    );

    const game_indices = pokemonDto.game_indices.map(
      ({ version, game_index }) => ({
        ...version,
        value: game_index,
        pokemon,
      }),
    );

    const held_items = pokemonDto.held_items.map(
      ({ item: rest, version_details }) => {
        let item = new Item();

        item = {
          ...rest,
          pokemon,
          version_details: version_details.map(({ rarity, version }) => ({
            ...version,
            rarity,
          })),
        };

        return item;
      },
    );

    const moves = pokemonDto.moves.map(
      ({ move: rest, version_group_details }) => {
        let move = new Move();

        move = {
          ...rest,
          pokemon,
          version_group_details: version_group_details.map((details) => ({
            ...details,
          })),
        };

        return move;
      },
    );

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

    pokemon.abilities = abilities;
    pokemon.game_indices = game_indices;
    pokemon.held_items = held_items;
    pokemon.moves = moves;
    pokemon.sprites = sprites;
    pokemon.stats = stats;
    pokemon.types = types;

    return pokemon;
  }

  addDetails(pokemon: Pokemon) {
    const moves: Array<Move> = pokemon.moves.map((move) => ({
      ...move,
      version_group_details: move.version_group_details.map(
        ({ move: _, ...rest }) => ({
          ...rest,
          move,
        }),
      ),
    }));

    const held_items: Array<Item> = pokemon.held_items.map((item) => ({
      ...item,
      version_details: item.version_details.map(({ item: _, ...rest }) => ({
        ...rest,
        item,
      })),
    }));

    pokemon.held_items = held_items;
    pokemon.moves = moves;

    return pokemon;
  }

  async create(pokemonDto: JsonPokemonDto) {
    const entity = this.toEntity(pokemonDto);
    const partial = await this.pokemonsRepository.save(entity);

    const pokemon = this.addRelations(pokemonDto, partial);
    return this.pokemonsRepository.save(pokemon);
  }

  async createMany(pokemonDtoArr: JsonPokemonDto[]) {
    let pokemon = pokemonDtoArr.map((pokemonDto) => this.toEntity(pokemonDto));
    pokemon = await this.pokemonsRepository.save(pokemon);

    pokemon = pokemon.map((partial, i) =>
      this.addRelations(pokemonDtoArr[i], partial),
    );
    pokemon = await this.pokemonsRepository.save(pokemon);

    pokemon = pokemon.map((partial) => this.addDetails(partial));
    const result = await this.pokemonsRepository.save(pokemon);

    return result;
  }

  findAll(options: FindOptions) {
    const isSort = (x: FindOptions): x is SortOptions => 'order' in x;

    if (isSort(options)) {
      switch (options.sortBy) {
        case 'name':
          return this.pokemonsRepository.find({
            order: { form: { name: options.order } },
          });
        case 'id':
          // defaults to ID?
          return this.pokemonsRepository.find({
            // order: { form: { name: order } },
          });
        default:
          throw Error(`unimplemented`);
      }
    }

    return this.pokemonsRepository
      .createQueryBuilder('pokemon')
      .innerJoin('pokemon.types', 'type')
      .where(`type.name ILIKE :query OR name ILIKE :query`, {
        query: `%${options.query}%`,
      })
      .getMany();
  }

  findOne(id: number) {
    return this.pokemonsRepository.findOne({
      where: { id },
      relations: ['sprites', 'types'],
    });
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }

  removeAll() {
    return this.pokemonsRepository.clear();
  }
}
