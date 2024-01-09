import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { CreatePokemonDto, NoNull } from './dto/create-pokemon.dto';
import {
  Ability,
  GameIndex,
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

const isSearchOptions = (opts: FindOptions): opts is SearchOptions =>
  'query' in opts;

// this is so we can return the relations with the ID
// Omit past_types because we don't need it
type Relations<P = Omit<Pokemon, 'id' | 'past_types'>> = {
  [K in keyof P as P[K] extends Array<infer _I>
    ? K
    : never]: P[K] extends Array<infer I> ? Array<Omit<I, 'pokemon'>> : never;
};

type Keys = keyof Omit<Relations, 'id'>;

type RelationMap = {
  [K in Keys]: {
    [id: number]: Relations[K];
  };
};

const relationToMap = (
  init: RelationMap,
  relations: Relations & { id: number },
): RelationMap => {
  const { id, ...rest } = relations;

  return Object.entries(rest as Relations).map(([k, v]) => ({
    ...init,
    [k as Keys]: { ...init[k as Keys], [id]: v },
  }));
};

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(Pokemon) private pokemonsRepository: Repository<Pokemon>,
  ) {}

  toEntity(pokemonDto: CreatePokemonDto) {
    const pokemon = new Pokemon();

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

  // TODO: return type
  addRelations(pokemonDto: CreatePokemonDto, pokemon: number) {
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
    // this.pokemonsRepository.preload

    const held_items = pokemonDto.held_items.map(
      ({ item: rest, version_details }) => ({
        ...rest,
        pokemon,
        version_details: version_details.map(({ rarity, version }) => ({
          ...version,
          rarity,
        })),
      }),
    );

    const moves = pokemonDto.moves.map(
      ({ move: rest, version_group_details }) => ({
        ...rest,
        pokemon,
        version_group_details: version_group_details.map((details) => ({
          ...details,
        })),
      }),
    );

    const { other, versions, ...baseSprites } = pokemonDto.sprites;

    const spritesByVersion = Object.entries(versions).flatMap(
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

    const otherSprites = Object.entries(other).map(([title, spriteMap]) => ({
      ...(spriteMap as NoNull<SpriteMap>),
      pokemon,
      isOther: true,
      title,
    }));

    const sprites = [
      { ...baseSprites, pokemon },
      ...spritesByVersion,
      ...otherSprites,
    ];

    const stats = pokemonDto.stats.map(({ stat, effort, base_stat }) => ({
      ...stat,
      effort,
      base_stat,
      pokemon,
    }));

    const types = pokemonDto.types.map(({ slot, type }) => ({
      ...type,
      slot,
      pokemon,
    }));

    return {
      abilities,
      game_indices,
      held_items,
      moves,
      sprites,
      stats,
      types,
    } as Relations;
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

  async create(pokemonDto: CreatePokemonDto) {
    const entity = this.toEntity(pokemonDto);
    const partial = await this.pokemonsRepository.save(entity);

    const pokemon = this.addRelations(pokemonDto, partial);
    return this.pokemonsRepository.save(pokemon);
  }

  // TODO: too slow
  async createMany(pokemonDtoArr: CreatePokemonDto[]) {
    let pokemon = pokemonDtoArr.map((pokemonDto) => this.toEntity(pokemonDto));
    const { raw } = await this.pokemonsRepository
      .createQueryBuilder()
      .insert()
      .values(pokemon)
      .returning('id')
      .execute();

    // not typed sadly but more efficient
    const ids: number[] = raw.map((result: any) => result.id!);
    const relations = pokemonDtoArr.map((dto, i) =>
      this.addRelations(dto, ids[i]),
    );

    const relationMap = relations.reduce(relationToMap);

    relations.map(({ id, relations }) => {
      this.pokemonsRepository
        .createQueryBuilder()
        .relation(/* key of relation */)
        .of(id)
        .add(/* value of relation */);
    });

    pokemon = pokemon.map((partial) => this.addDetails(partial));
    const result = await this.pokemonsRepository.save(pokemon);
    console.log('3');

    return result;
  }

  // show 10 results if no limit was defined
  async findAll(findOpts: FindOptions = {}): Promise<Pokemon[]> {
    if (isSearchOptions(findOpts)) {
      const { query, limit } = findOpts;

      return this.pokemonsRepository
        .createQueryBuilder('pokemon')
        .leftJoin('pokemon.sprites', 'sprite')
        .leftJoin('pokemon.types', 'type')
        .where(`type.name ILIKE :query OR name ILIKE :query`, {
          query: `%${query}%`,
        })
        .take(limit)
        .execute();
    }

    const { sortBy, order: direction, limit: take, offset: skip } = findOpts;

    const order =
      sortBy === 'name'
        ? { form: { name: direction } }
        : sortBy === 'id'
          ? { id: direction }
          : undefined;
    const opts: FindManyOptions = {
      relations: ['sprites', 'types'],
      order,
      take,
      skip,
    };

    const result = await this.pokemonsRepository.find(opts);

    return result;
  }

  async findOne(id: number) {
    const pokemon = await this.pokemonsRepository
      .createQueryBuilder('pokemon')
      .where({ id })
      // not sure if indices are used automatically, should have given descriptive names
      .useIndex('IDX_ee2a4e1b57db5392145fe6eefb')
      .useIndex('IDX_60a975c4d9904819e08e413bb3')
      .useIndex('IDX_e838af4590b44f9f01fb5a355b')
      .useIndex('IDX_67af8e7b41ad55426cc3932bb7')
      .leftJoinAndSelect('pokemon.sprites', 'sprite')
      .leftJoinAndSelect('pokemon.types', 'type')
      .leftJoinAndSelect('pokemon.stats', 'stat')
      .leftJoinAndSelect('pokemon.abilities', 'ability')
      .getOne();

    if (!pokemon) {
      return null;
    }

    // querying moves separately is faster
    // also due to a bug that doesn't properly expand embedded entities
    // https://github.com/typeorm/typeorm/issues/8112
    const rest = await this.pokemonsRepository
      .createQueryBuilder('pokemon')
      .where({ id })
      .useIndex('IDX_ce791a0a93f777c04011f2a403')
      .leftJoinAndSelect('pokemon.moves', 'move')
      .leftJoinAndSelect('move.version_group_details', 'version_group_details')
      .addSelect([
        'version_group_details.level_learned_at',
        // we don't need the URLs in our response
        'version_group_details.moveLearnMethodName',
        'version_group_details.versionGroupName',
      ])
      .getOne();

    return { ...pokemon, moves: rest?.moves } as Pokemon;
  }

  removeAll() {
    return this.pokemonsRepository.clear();
  }
}
