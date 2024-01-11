import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { Item, Move, Pokemon } from './entities/pokemon.entity';
import { PokemonPage } from './dto/get-pokemon';
import {
  FindOptionsDto,
  PokemonOptionsDto,
  SearchOptionsDto,
} from './dto/find-options.dto';
import { PAGE_SIZE } from './pokemons.constant';

// this is so we can return the relations with the ID
type PickArrayChildren<P> = {
  [K in keyof P as P[K] extends Array<infer _> ? K : never]: P[K] extends Array<
    infer I
  >
    ? Array<I>
    : never;
};

export type Relations = PickArrayChildren<Omit<Pokemon, 'id'>>;
export type Details = PickArrayChildren<
  Pick<Item & Move, 'version_details' | 'version_group_details'>
>;

@Injectable()
export class PokemonsService {
  constructor(
    @InjectRepository(Pokemon) private pokemonsRepository: Repository<Pokemon>,
  ) {}

  async create(pokemonDto: CreatePokemonDto) {
    const pokemon = new Pokemon();
    pokemon.fromDto(pokemonDto);

    await this.pokemonsRepository.insert(pokemon);

    let preload = await this.pokemonsRepository
      .createQueryBuilder()
      .where({ name: pokemon.form.name })
      .getOne();

    const relations = pokemon.createRelations(pokemonDto);
    pokemon.updateRelations(relations);

    const saveRelations = Object.entries(relations).map(([k, v]) =>
      this.pokemonsRepository
        .createQueryBuilder()
        .insert()
        .values(
          v.map((r) => ({
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
      .where({ name: pokemon.form.name })
      .getOne();

    const details = pokemon.createDetails(pokemonDto);
    pokemon.updateDetails(details);

    const saveDetails = Object.entries(details).map(([k, v]) =>
      this.pokemonsRepository
        .createQueryBuilder()
        .insert()
        .values(
          v.map((r) => ({
            ...r,
            pokemon: preload,
          })),
        )
        .into(k)
        .execute(),
    );
    await Promise.all(saveDetails);

    return this.pokemonsRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Pokemon.sprites', 'sprite')
      .leftJoinAndSelect('Pokemon.types', 'type')
      .getMany();
  }

  async createMany(pokemonDtoArr: CreatePokemonDto[]) {
    const entities = pokemonDtoArr.map((pokemonDto) => {
      const pokemon = new Pokemon();
      pokemon.fromDto(pokemonDto);

      return pokemon;
    });
    await this.pokemonsRepository.insert(entities);

    let preload = await this.pokemonsRepository.createQueryBuilder().getMany();

    const saveRelations = entities.flatMap((e, i) => {
      const relations = e.createRelations(pokemonDtoArr[i]);
      e.updateRelations(relations);

      return Object.entries(relations).map(([k, v]) =>
        this.pokemonsRepository
          .createQueryBuilder()
          .insert()
          .values(
            v.map((r) => ({
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

    const saveDetails = entities.flatMap((e, i) => {
      const details = e.createDetails(pokemonDtoArr[i]);
      e.updateDetails(details);

      return Object.entries(details).map(([k, v]) =>
        this.pokemonsRepository
          .createQueryBuilder()
          .insert()
          .values(
            v.map((r) => ({
              ...r,
              pokemon: preload[i],
            })),
          )
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

  async findAll<F extends FindOptionsDto>(findOptions: F, paginated?: boolean) {
    if ('query' in findOptions) {
      const { query, limit = 10 } = findOptions;

      const data = await this.pokemonsRepository
        .createQueryBuilder()
        .leftJoin('Pokemon.sprites', 'sprite')
        .leftJoin('Pokemon.types', 'type')
        .where(`type.name ILIKE :query OR name ILIKE :query`, {
          query: `%${query}%`,
        })
        .take(limit)
        .getMany();

      return { data };
    }

    const {
      sort,
      limit: take = paginated ? 10 : undefined,
      offset: skip = 0,
    } = findOptions as PokemonOptionsDto;
    const [sortBy, order] = sort ? sort.split('-', 2) : [undefined, undefined];

    const options: FindManyOptions = {
      relations: ['sprites', 'types'],
      order: sortBy === 'name' ? { form: { name: order } } : { id: order },
      take,
      skip,
    };

    const data = await this.pokemonsRepository
      .createQueryBuilder()
      .leftJoin('Pokemon.sprites', 'sprite')
      .leftJoin('Pokemon.types', 'type')
      .setFindOptions(options)
      .getMany();

    if (!paginated) {
      return { data };
    }

    const all = await this.pokemonsRepository.find({ select: ['id'] });

    const pages = all.length !== 0 ? Math.ceil(all.length / PAGE_SIZE) : 0;
    const page = all.length !== 0 ? Math.floor(skip / PAGE_SIZE) : 0;

    return {
      data,
      metadata: {
        total: all.length,
        pages,
        page,
      },
    } as PokemonPage;
  }

  async findOne(id: number): Promise<Pokemon | null> {
    const pokemon = await this.pokemonsRepository
      .createQueryBuilder()
      .where({ id })
      // not sure if indices are used automatically, should have given descriptive names
      // .useIndex('IDX_ee2a4e1b57db5392145fe6eefb')
      // .useIndex('IDX_60a975c4d9904819e08e413bb3')
      // .useIndex('IDX_e838af4590b44f9f01fb5a355b')
      // .useIndex('IDX_67af8e7b41ad55426cc3932bb7')
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
    const details = await this.pokemonsRepository
      .createQueryBuilder('Pokemon')
      .where({ id })
      // .useIndex('IDX_ce791a0a93f777c04011f2a403')
      .leftJoinAndSelect('Pokemon.moves', 'move')
      .leftJoinAndSelect('Pokemon.held_items', 'held_items')
      .leftJoinAndSelect('move.version_group_details', 'version_group_details')
      .leftJoinAndSelect('held_items.version_details', 'version_details')
      .addSelect([
        'version_group_details.level_learned_at',
        'version_group_details.moveLearnMethodName',
        'version_group_details.versionGroupName',
        'version_details.name',
        'version_details.rarity',
      ])
      .getOne();

    if (!details) {
      return null;
    }

    const { moves, held_items } = details;

    return { ...pokemon, moves, held_items } as Pokemon;
  }

  removeAll() {
    return this.pokemonsRepository.clear();
  }
}
