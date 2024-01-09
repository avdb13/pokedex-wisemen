import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as pokemonsJson from '../pokemons-simple.json';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { INestApplication } from '@nestjs/common';
import {
  PokemonDetailsInterceptor,
  toPokemon,
  toPokemonDetails,
} from './pokemons.interceptor';
import * as supertest from 'supertest';
import { GetPokemonDetailsDto, GetPokemonDto } from './dto/get-pokemon';
import { json } from 'express';

describe('PokemonsController', () => {
  let app: INestApplication;
  let service: PokemonsService;
  let request: supertest.SuperTest<supertest.Test>;
  const pokemons: CreatePokemonDto[] = pokemonsJson;

  const toEntity = (dto: CreatePokemonDto, id: number = 0) => {
    // test test
    const entity = service.toEntity(dto);
    const pokemon = { ...entity, ...service.addRelations(dto, id) };
    const result = service.addDetails(pokemon as Pokemon);

    // not pretty but JS arrays start at 0 and PSQL at 1
    return { ...result, id: id + 1 };
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
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
      providers: [PokemonsService, PokemonDetailsInterceptor],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(json({ limit: '10mb' }));
    await app.init();

    service = app.get<PokemonsService>(PokemonsService);

    // timeout ?
    // await controller.importFromJson(pokemonsJson as CreatePokemonDto[]);

    request = supertest(app.getHttpServer());

    if ((await service.findAll()).length !== pokemons.length) {
      // await request.delete('/api/v1/pokemons').expect(204);
      // await request
      //   .post('/api/v1/pokemons')
      //   .send(pokemons)
      //   .set('Content-Type', 'application/json')
      //   .set('Accept', 'application/json')
      //   .expect(201);
    }
  });

  describe('GET /', () => {
    let all: Pokemon[];
    let fromDb: GetPokemonDto[];
    let fromJson: GetPokemonDto[];

    beforeAll(async () => {
      all = await service.findAll();

      fromDb = all.map(toPokemon);
      fromJson = pokemons.map(toEntity).map(toPokemon);
      // console.log(
      //   inspect(
      //     fromDb.map(({ name, types }) => ({ name, types })),
      //     false,
      //     null,
      //     true,
      //   ),
      //   inspect(
      //     fromJson.map(({ name, types }) => ({ name, types })),
      //     false,
      //     null,
      //     true,
      //   ),
      // );

      expect(fromJson).toEqual(fromDb);
    });

    describe('200 OK', () => {
      it('no queries', async () => {
        request.get('/api/v1/pokemons').expect(200).expect(fromDb);
      }, 30_000);

      it('sort', async () => {
        request
          .get('/api/v1/pokemons')
          .query({ sort: 'name-asc' })
          .expect(200)
          .expect(
            fromDb.toSorted((a, b) =>
              a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
            ),
          );

        request
          .get('/api/v1/pokemons')
          .query({ sort: 'id-desc' })
          .expect(200)
          .expect(fromDb.toReversed());
      }, 30_000);
    });

    describe('400 BAD_REQUEST', () => {
      it('sort', async () => {
        const fromJson = pokemons.map(toEntity).map(toPokemon);
        const fromDb = (await service.findAll()).map(toPokemon);

        expect(fromJson).toEqual(fromDb);

        request
          .get('/api/v1/pokemons')
          .query({ sort: 'weight-desc' })
          .expect(400);
        // .expect();
      }, 30_000);
    });
  });

  describe('GET /{:id}', () => {
    let one: Pokemon | null;
    let fromDb: GetPokemonDetailsDto;
    let fromJson: GetPokemonDetailsDto;

    beforeAll(async () => {
      one = await service.findOne(1);
      fromDb = toPokemonDetails(one!);
      fromJson = toPokemonDetails(toEntity(pokemons[0]));

      expect(fromJson).toEqual(fromDb);
    });

    it('200 OK', async () => {
      request.get('/api/v1/pokemons/1').expect(200).expect(fromDb);
    }, 30_000);

    it('400 BAD_REQUEST', async () => {
      request.get(`/api/v1/pokemons/jigglypuff`).expect(400);
    });

    it('404 NOT_FOUND', async () => {
      request.get('/api/v1/pokemons/-404').expect(404);
      // .expect();

      request.get(`/api/v1/pokemons/${pokemons.length + 1}`).expect(404);
      // .expect();
    }, 30_000);
  });
});
describe('SearchController', () => {
  let app: INestApplication;
  let service: PokemonsService;
  let request: supertest.SuperTest<supertest.Test>;
  const pokemons: CreatePokemonDto[] = pokemonsJson;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
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
      providers: [PokemonsService, PokemonDetailsInterceptor],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(json({ limit: '10mb' }));
    await app.init();

    service = app.get<PokemonsService>(PokemonsService);

    // timeout ?
    // await controller.importFromJson(pokemonsJson as CreatePokemonDto[]);

    request = supertest(app.getHttpServer());

    if ((await service.findAll()).length !== pokemons.length) {
      // await request.delete('/api/v1/pokemons').expect(204);
      // await request
      //   .post('/api/v1/pokemons')
      //   .send(pokemons)
      //   .set('Content-Type', 'application/json')
      //   .set('Accept', 'application/json')
      //   .expect(201);
    }
  });

  describe('GET /', () => {
    let all: Pokemon[];
    let fromDb: GetPokemonDto[];
    let fromJson: GetPokemonDto[];

    beforeAll(async () => {
      all = await service.findAll();

      fromDb = all.map(toPokemon);
      fromJson = pokemons.map(toEntity).map(toPokemon);
      // console.log(
      //   inspect(
      //     fromDb.map(({ name, types }) => ({ name, types })),
      //     false,
      //     null,
      //     true,
      //   ),
      //   inspect(
      //     fromJson.map(({ name, types }) => ({ name, types })),
      //     false,
      //     null,
      //     true,
      //   ),
      // );

      expect(fromJson).toEqual(fromDb);
    });

    describe('200 OK', () => {
      it('query', async () => {
        request
          .get('/api/v1/search')
          .query({ query: 'arman' })
          .expect(200)
          .expect(pokemons.filter((p) => p.name.indexOf('arman') >= 0));

        request
          .get('/api/v1/pokemons')
          .query({ sort: 'id-desc' })
          .expect(200)
          .expect(pokemons.filter((p) => p.name.indexOf('arman') >= 0));
      }, 30_000);
    });

    describe('400 BAD_REQUEST', () => {
      it('sort', async () => {
        const fromJson = pokemons.map(toEntity).map(toPokemon);
        const fromDb = (await service.findAll()).map(toPokemon);

        expect(fromJson).toEqual(fromDb);

        request
          .get('/api/v1/pokemons')
          .query({ sort: 'weight-desc' })
          .expect(400);
        // .expect();
      }, 30_000);
    });
  });

  describe('GET /{:id}', () => {
    let one: Pokemon | null;
    let fromDb: GetPokemonDetailsDto;
    let fromJson: GetPokemonDetailsDto;

    beforeAll(async () => {
      one = await service.findOne(1);
      fromDb = toPokemonDetails(one!);
      fromJson = toPokemonDetails(toEntity(pokemons[0]));

      expect(fromJson).toEqual(fromDb);
    });

    it('200 OK', async () => {
      request.get('/api/v1/pokemons/1').expect(200).expect(fromDb);
    }, 30_000);

    it('400 BAD_REQUEST', async () => {
      request.get(`/api/v1/pokemons/jigglypuff`).expect(400);
    });

    it('404 NOT_FOUND', async () => {
      request.get('/api/v1/pokemons/-404').expect(404);
      // .expect();

      request.get(`/api/v1/pokemons/${pokemons.length + 1}`).expect(404);
      // .expect();
    }, 30_000);
  });
});
