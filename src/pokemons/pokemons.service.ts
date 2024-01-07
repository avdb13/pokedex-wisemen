import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import {
  Item,
  Kind,
  Move,
  Pokemon,
  Sprite,
  SpriteMap,
  Stat,
  titles,
} from './entities/pokemon.entity';
import { FindOptions, SearchOptions } from './pokemons.guard';
import { CreatePokemonDto, NoNull } from './dto/create-pokemon.dto';

const isSearchOptions = (opts: FindOptions): opts is SearchOptions =>
  'query' in opts;

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(Pokemon) private pokemonsRepository: Repository<Pokemon>,
  ) {}

  private toEntity(pokemonDto: CreatePokemonDto) {
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

  private addRelations(pokemonDto: CreatePokemonDto, pokemon: Pokemon) {
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
                  ...(spriteMap as NoNull<SpriteMap>),
                  pokemon,
                  title: title in titles ? title : undefined,
                  is_icons: title === 'icons',
                },
                {
                  ...(spriteMap.animated as NoNull<SpriteMap>),
                  is_animated: true,
                  pokemon,
                  title: title in titles ? title : undefined,
                },
              ]
            : [
                {
                  ...(spriteMap as NoNull<SpriteMap>),
                  pokemon,
                  title: title in titles ? title : undefined,
                  is_icons: title === 'icons',
                },
              ],
        ),
    );

    const otherSprites: Array<Sprite> = Object.entries(other).map(
      ([_generation, spriteMap]) => ({
        ...(spriteMap as NoNull<SpriteMap>),
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

  private addDetails(pokemon: Pokemon) {
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

  async create(pokemonDto: CreatePokemonDto) {
    const entity = this.toEntity(pokemonDto);
    const partial = await this.pokemonsRepository.save(entity);

    const pokemon = this.addRelations(pokemonDto, partial);
    return this.pokemonsRepository.save(pokemon);
  }

  async createMany(pokemonDtoArr: CreatePokemonDto[]) {
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

  // show 10 results if no limit was defined
  findAll(findOpts: FindOptions = {}) {
    if (isSearchOptions(findOpts)) {
      const { query, limit } = findOpts;

      return this.pokemonsRepository
        .createQueryBuilder('pokemon')
        .innerJoin('pokemon.types', 'type')
        .where(`type.name ILIKE :query OR name ILIKE :query`, {
          query: `%${query}%`,
        })
        .take(limit);
    }

    const { sortBy, order: direction, limit: take, offset: skip } = findOpts;

    const order =
      sortBy === 'name'
        ? { form: { name: direction } }
        : sortBy === 'id'
          ? { id: direction }
          : undefined;
    const opts: FindManyOptions = {
      order,
      take,
      skip,
    };

    this.pokemonsRepository.find(opts);
  }

  findOne(id: number) {
    return this.pokemonsRepository.findOne({
      where: { id },
      relations: ['sprites', 'types'],
    });
  }

  removeAll() {
    return this.pokemonsRepository.clear();
  }
}
