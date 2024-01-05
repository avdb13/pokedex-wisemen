import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { JsonPokemonDto } from './dto/json-pokemon.dto';
import { pokemons } from './../pokemons';
import { Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { Provider } from '@nestjs/common';

// TODO: try mock instead of DB
describe('PokemonsService', () => {
  let service: PokemonsService;
  let module: TestingModule;

  beforeAll(async () => {
    const PokemonRepository: Provider = {
      provide: getRepositoryToken(Pokemon),
      useClass: Repository,
    };

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          password: 'pokedex',
          username: 'pokedex',
          dropSchema: true,
          entities: ['./entities/pokemon.entity.ts'],
          database: 'pokedex',
          synchronize: true,
          logging: true,
        }),
      ],
      providers: [PokemonsService, PokemonRepository],
    }).compile();

    service = module.get<PokemonsService>(PokemonsService);
  });

  afterAll(async () => {
    module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should work', async () => {
    const sample: JsonPokemonDto = pokemons[0];
    try {
      await service.create(sample);
    } catch (e) {
      console.error(e);
    }
  });
});
