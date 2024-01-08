import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as pokemonsJson from '../pokemons-simple.json';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { GetPokemonDetailsDto } from './dto/get-pokemon';
import { InternalServerErrorException } from '@nestjs/common';
import { SpriteMap } from './entities/pokemon.entity';
import { isBaseSprite } from './pokemons.interceptor';

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;
  let req: unknown;

  const pokemons: CreatePokemonDto[] = pokemonsJson;

  const toPokemonDetails = (pokemon: Pokemon): GetPokemonDetailsDto => {
    const {
      id,
      form: { name },
      sprites: tooManySprites,
      types,
      height,
      weight,
      moves,
      order,
      species,
      stats,
      abilities,
    } = pokemon;

    const sprite = tooManySprites.find(isBaseSprite);

    if (!sprite) {
      throw new InternalServerErrorException();
    }

    const sprites: SpriteMap = Object.keys(sprite).reduce(
      (init, k, i) =>
        k in SpriteMap ? { ...init, [k]: Object.values(sprite)[i] } : init,
      {} as SpriteMap,
    );

    const ok = {
      id,
      name,
      sprites,
      types: types.map(({ slot, name }) => ({
        slot,
        type: { name },
      })),
      height,
      weight,
      moves: moves.map(({ name, version_group_details }) => ({
        move: name,
        version_group_details: version_group_details.map(
          ({ level_learned_at, version_group, move_learn_method }) => ({
            level_learned_at,
            version_group: version_group.name,
            move_learn_method: move_learn_method.name,
          }),
        ),
      })),
      order,
      species: species.name,
      // test whether it returns only the fields we want
      stats: stats.map(({ base_stat, name, effort }) => ({
        base_stat,
        stat: name,
        effort,
      })),
      abilities: abilities.map(({ name, is_hidden, slot }) => ({
        ability: name,
        is_hidden,
        slot,
      })),
      form: name,
    } as GetPokemonDetailsDto;

    return ok;
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          password: 'pokedex',
          username: 'pokedex',
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          database: 'pokedex',
          synchronize: true,
          logging: ['error'],
        }),
        TypeOrmModule.forFeature([Pokemon]),
      ],

      controllers: [PokemonsController],
      providers: [PokemonsService],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
    service = module.get<PokemonsService>(PokemonsService);

    controller.importFromJson(pokemonsJson as CreatePokemonDto[]);
  });

  it('GET /', async () => {
    const { toEntity, addRelations, addDetails } = service;

    const serialize = (p: CreatePokemonDto) =>
      addDetails(addRelations(p, toEntity(p)));

    const found = await controller.findOne(1);
    const pokemon = toPokemonDetails(found);
    const expected = toPokemonDetails(serialize(pokemons[0]));

    expect(pokemon.moves).toEqual(expected.moves);
    expect(pokemon.species).toEqual(expected.species);
    expect(pokemon.stats).toEqual(expected.stats);
    expect(pokemon.sprites).toEqual(expected.sprites);
  }, 30_000);

  it('GET /{:id}', async () => {
    // const { moves: _, ...pokemon } = await controller.findAll();
    // const { moves: __, ...expected } = f(pokemons);
    // expect(JSON.stringify(pokemon, null, 2)).toEqual(
    //   JSON.stringify(toPokemonDetails(expected), null, 2),
    // );
  }, 30_000);
});
