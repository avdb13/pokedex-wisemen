import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { CreatePokemonDto, NoNull } from './dto/create-pokemon.dto';
import {
  Item,
  Move,
  Pokemon,
  Sprite,
  SpriteMap,
} from './entities/pokemon.entity';
import { FindOptions, SearchOptions } from './pokemons.guard';
import { PokemonPage } from './dto/get-pokemon';

const isSearchOptions = (opts: FindOptions): opts is SearchOptions =>
  'query' in opts;

// this is so we can return the relations with the ID
type PickArrayChildren<P> = {
  [K in keyof P as P[K] extends Array<infer _> ? K : never]: P[K] extends Array<
    infer I
  >
    ? Array<I>
    : never;
};
type UnionMap<R extends object> = {
  [K in keyof R as string]: R[K];
};

type Relations = PickArrayChildren<Omit<Pokemon, 'id'>>;
type Details = PickArrayChildren<PickArrayChildren<Move & Item>>;

type RelationMap = UnionMap<Relations>;
type DetailsMap = UnionMap<Details>;

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(Pokemon) private pokemonsRepository: Repository<Pokemon>,
  ) {}

  toEntity(pokemonDto: CreatePokemonDto) {
    const pokemon = new Pokemon();

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
    pokemon.form = pokemonDto.forms[0];

    pokemon.abilities = pokemonDto.abilities.map(({ ability, ...rest }) => ({
      ...ability,
      ...rest,
      pokemon,
    }));

    pokemon.game_indices = pokemonDto.game_indices.map(
      ({ version, game_index }) => ({
        ...version,
        value: game_index,
        pokemon,
      }),
    );

    pokemon.held_items = pokemonDto.held_items.map(
      ({ item: rest, version_details }) => {
        let item = new Item();

        item = {
          pokemon,
          ...rest,
          version_details: version_details.map(({ version, ...rest }) => ({
            ...version,
            ...rest,
            item,
          })),
        };

        return item;
      },
    );

    pokemon.moves = pokemonDto.moves.map(
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

    const { other, versions, ...baseSprites } = pokemonDto.sprites;

    const spritesByVersion = Object.entries(versions).flatMap(
      ([_generation, sprites]) =>
        Object.entries(sprites).flatMap(([title, spriteMap]) =>
          spriteMap.animated
            ? [
                {
                  ...(spriteMap as NoNull<SpriteMap>),
                  pokemon,
                  title,
                  is_icons: title === 'icons',
                },
                {
                  ...(spriteMap.animated as NoNull<SpriteMap>),
                  is_animated: true,
                  pokemon,
                  title,
                },
              ]
            : [
                {
                  ...(spriteMap as NoNull<SpriteMap>),
                  pokemon,
                  title,
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

    pokemon.sprites = [
      { ...baseSprites, pokemon },
      ...spritesByVersion,
      ...otherSprites,
    ] as Sprite[];

    pokemon.stats = pokemonDto.stats.map(({ stat, effort, base_stat }) => ({
      ...stat,
      effort,
      base_stat,
      pokemon,
    }));

    pokemon.types = pokemonDto.types.map(({ slot, type }) => ({
      ...type,
      slot,
      pokemon,
    }));

    return pokemon;
  }

  async create(pokemonDto: CreatePokemonDto) {
    const entity = this.toEntity(pokemonDto);

    await this.pokemonsRepository.insert(entity);

    // must be the latest
    let preload = await this.pokemonsRepository.createQueryBuilder().getOne();

    const relations: RelationMap = Object.fromEntries(
      Object.entries(entity).filter(([_k, v]) => Array.isArray(v)),
    );

    const saveRelations = Object.keys(relations).map((k) =>
      this.pokemonsRepository
        .createQueryBuilder()
        .insert()
        .values(
          relations[k].map((r) => ({
            ...r,
            pokemon: preload,
          })),
        )
        .into(k)
        .execute(),
    );
    await Promise.all(saveRelations);

    preload = await this.pokemonsRepository
      .createQueryBuilder()
      .select()
      .leftJoinAndSelect('Pokemon.moves', 'moves')
      .leftJoinAndSelect('Pokemon.held_items', 'held_items')
      .getOne();

    // can be made faster
    const details = {
      version_details: preload!.held_items.flatMap((v, j) =>
        entity.held_items[j].version_details.map(({ item: _, ...rest }) => ({
          item: v,
          ...rest,
        })),
      ),
      version_group_details: preload!.moves.flatMap((v, j) =>
        entity.moves[j].version_group_details.map(({ move: _, ...rest }) => ({
          move: v,
          ...rest,
        })),
      ),
    };

    const detailsMap: DetailsMap = Object.fromEntries(
      Object.entries(details).filter(([_k, v]) => Array.isArray(v)),
    );

    const saveDetails = Object.keys(detailsMap).map((k) =>
      this.pokemonsRepository
        .createQueryBuilder()
        .insert()
        .values(detailsMap[k])
        .into(k)
        .execute(),
    );
    await Promise.all(saveDetails);

    return this.pokemonsRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Pokemon.sprites', 'sprite')
      .leftJoinAndSelect('Pokemon.types', 'type')
      .getOne();
  }

  async createMany(pokemonDtoArr: CreatePokemonDto[]) {
    const entities = pokemonDtoArr.map((pokemonDto) =>
      this.toEntity(pokemonDto),
    );

    await this.pokemonsRepository.insert(entities);

    let preload = await this.pokemonsRepository.createQueryBuilder().getMany();

    const saveRelations = entities.flatMap((e, i) => {
      const relations: RelationMap = Object.fromEntries(
        Object.entries(e).filter(([_k, v]) => Array.isArray(v)),
      );

      return Object.keys(relations).map((k) =>
        this.pokemonsRepository
          .createQueryBuilder()
          .insert()
          .values(
            relations[k].map((r) => ({
              ...r,
              pokemon: preload[i],
            })),
          )
          .into(k)
          .execute(),
      );
    });
    await Promise.all(saveRelations);

    preload = await this.pokemonsRepository
      .createQueryBuilder()
      .select()
      .leftJoinAndSelect('Pokemon.moves', 'moves')
      .leftJoinAndSelect('Pokemon.held_items', 'held_items')
      .orderBy('Pokemon.id', 'ASC')
      .getMany();

    // can be made faster
    const details = preload.map(({ held_items, moves }, i) => ({
      version_details: held_items.flatMap((v, j) =>
        entities[i].held_items[j].version_details.map(
          ({ item: _, ...rest }) => ({
            item: v,
            ...rest,
          }),
        ),
      ),
      version_group_details: moves.flatMap((v, j) =>
        entities[i].moves[j].version_group_details.map(
          ({ move: _, ...rest }) => ({
            move: v,
            ...rest,
          }),
        ),
      ),
    }));

    const saveDetails = details.flatMap((d) => {
      const details: DetailsMap = Object.fromEntries(
        Object.entries(d).filter(([_k, v]) => Array.isArray(v)),
      );

      return Object.keys(details).map((k) =>
        this.pokemonsRepository
          .createQueryBuilder()
          .insert()
          .values(details[k])
          .into(k)
          .execute(),
      );
    });
    await Promise.all(saveDetails);

    return this.pokemonsRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Pokemon.sprites', 'sprite')
      .leftJoinAndSelect('Pokemon.types', 'type')
      .getMany();
  }

  async findAll(
    findOptions: FindOptions = {},
    paginated: boolean = false,
  ): Promise<PokemonPage> {
    if (isSearchOptions(findOptions)) {
      const { query, limit = 10 } = findOptions;

      const data = await this.pokemonsRepository
        .createQueryBuilder()
        .leftJoin('Pokemon.sprites', 'sprite')
        .leftJoin('Pokemon.types', 'type')
        .where(`type.name ILIKE :query OR name ILIKE :query`, {
          query: `%${query}%`,
        })
        .take(limit)
        .execute();

      return { data };
    }

    const {
      sortBy,
      order: direction,
      limit: take = 10,
      offset: skip = 0,
    } = findOptions;

    const order =
      // sort by ID by default
      sortBy === 'name' ? { form: { name: direction } } : { id: direction };
    const opts: FindManyOptions = {
      relations: ['sprites', 'types'],
      order,
      take,
      skip,
    };

    const data = await this.pokemonsRepository
      .createQueryBuilder()
      .leftJoin('Pokemon.sprites', 'sprite')
      .leftJoin('Pokemon.types', 'type')
      .setFindOptions(opts)
      .getMany();

    if (!paginated) {
      return { data };
    }
    const all = await this.pokemonsRepository
      .createQueryBuilder()
      .select()
      .getMany();

    return {
      data,
      metadata: {
        next: '',
        previous: '',
        total: all.length,
        pages: Math.ceil(all.length / take!),
        page: Math.floor(skip! / take!),
      },
    };
  }

  async findOne(id: number): Promise<Pokemon | null> {
    const pokemon = await this.pokemonsRepository
      .createQueryBuilder()
      .where({ id })
      // not sure if indices are used automatically, should have given descriptive names
      .useIndex('IDX_ee2a4e1b57db5392145fe6eefb')
      .useIndex('IDX_60a975c4d9904819e08e413bb3')
      .useIndex('IDX_e838af4590b44f9f01fb5a355b')
      .useIndex('IDX_67af8e7b41ad55426cc3932bb7')
      .leftJoinAndSelect('Pokemon.sprites', 'sprite')
      .leftJoinAndSelect('Pokemon.moves', 'move')
      .leftJoinAndSelect('Pokemon.types', 'type')
      .leftJoinAndSelect('Pokemon.stats', 'stat')
      .leftJoinAndSelect('Pokemon.abilities', 'ability')
      .getOne();

    if (!pokemon) {
      return null;
    }

    // querying moves separately is faster
    // also due to a bug that doesn't properly expand embedded entities
    // https://github.com/typeorm/typeorm/issues/8112
    const rest = await this.pokemonsRepository
      .createQueryBuilder('Pokemon')
      .where({ id })
      .useIndex('IDX_ce791a0a93f777c04011f2a403')
      .leftJoinAndSelect('Pokemon.moves', 'move')
      .leftJoinAndSelect('move.version_group_details', 'version_group_details')
      .addSelect([
        'version_group_details.level_learned_at',
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
