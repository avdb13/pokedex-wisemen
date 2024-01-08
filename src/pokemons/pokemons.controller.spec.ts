import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as pokemonsJson from '../pokemons-simple.json';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

describe('PokemonsController', () => {
  let controller: PokemonsController;
  let service: PokemonsService;
  const pokemons: CreatePokemonDto[] = pokemonsJson;

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
    const pokemon = await controller.findOne(1);
    const expected = service.toEntity(pokemons[0]);

    expect(pokemon).toEqual(expected);
  }, 30_000);
});
