import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as pokemonsJson from '../pokemons-simple.json';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

const interceptorBody = (pokemon: Pokemon) => {
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

  const sprites: SpriteMap = { ...(sprite as SpriteMap) };

  return {
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
};

describe('PokemonsController', () => {
  let controller: PokemonsController;
  const pokemons: CreatePokemonDto = pokemonsJson;

  beforeEach(async () => {
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

    controller.importFromJson(pokemonsJson as CreatePokemonDto[]);
  });

  it('GET /', async () => {
    const ok = await controller.findOne(1);
    expect(ok).toEqual();

    console.log(ok);
  });
});
