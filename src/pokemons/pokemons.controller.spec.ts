import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { json } from 'express';
import { join } from 'path';

import * as pokemonsJson from './pokemons.json';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import {
  GetPokemonDetailsDto,
  GetPokemonDto,
  PokemonPage,
} from './dto/get-pokemon';
import { Pokemon } from './entities/pokemon.entity';
import { PokemonsController } from './pokemons.controller';
import {
  PokemonDetailsInterceptor,
  toPokemon,
  toPokemonDetails,
} from './pokemons.interceptor';
import { PokemonsService } from './pokemons.service';

// can't use ES6 import?
import supertest = require('supertest');

describe('pokemons', () => {
  let app: INestApplication;
  let service: PokemonsService;
  let request: supertest.SuperTest<supertest.Test>;
  // [ '0', '1', '2', '3', ..., 'default' ] ?
  const pokemons: CreatePokemonDto[] = Object.values(pokemonsJson)
    .map((obj, i) => ({ ...obj, id: i + 1 }))
    .slice(0, 24);

  const toEntity = (dto: CreatePokemonDto) => {
    const p = new Pokemon();

    p.fromDto(dto);
    p.updateRelations(p.createRelations(dto));
    p.updateDetails(p.createDetails(dto));

    return p;
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
          logging: ['error'],
        }),
        TypeOrmModule.forFeature([Pokemon]),
      ],

      controllers: [PokemonsController],
      providers: [PokemonsService, PokemonDetailsInterceptor],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(json({ limit: '1000mb' }));
    await app.init();

    service = app.get<PokemonsService>(PokemonsService);
    request = supertest(app.getHttpServer());

    await request
      .post('/api/v1/pokemons')
      .send(pokemons)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);
  });

  describe('/api/v1/pokemons', () => {
    describe('GET /', () => {
      let fromDb: GetPokemonDto[];
      let fromJson: GetPokemonDto[];

      beforeAll(async () => {
        const { data } = await service.findAll({});

        fromDb = data.map(toPokemon);
        fromJson = pokemons.map(toEntity).map(toPokemon);

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
          request
            .get('/api/v1/pokemons')
            .query({ sort: 'weight-desc' })
            .expect(400);
        }, 30_000);
      });
    });

    describe('GET /{id}', () => {
      let fromDb: GetPokemonDetailsDto;
      let fromJson: GetPokemonDetailsDto;

      beforeAll(async () => {
        const one = await service.findOne(1);
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

        request.get(`/api/v1/pokemons/${pokemons.length + 1}`).expect(404);
      }, 30_000);
    });
  });

  describe('/api/v1/search', () => {
    describe('GET /', () => {
      let fromDb: GetPokemonDto[];
      let fromJson: GetPokemonDto[];

      beforeAll(async () => {
        const { data } = await service.findAll({});

        fromDb = data.map(toPokemon);
        fromJson = pokemons.map(toEntity).map(toPokemon);

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
            .get('/api/v1/search')
            .query({ query: 'notapokemon' })
            .expect(200)
            .expect([]);
        }, 30_000);

        it('query and limit', async () => {
          request
            .get('/api/v1/search')
            .query({ query: 'aur', limit: 2 })
            .expect(200)
            .expect(
              pokemons.filter((p) => p.name.indexOf('aur') >= 0).slice(0, 2),
            );

          request
            .get('/api/v1/search')
            .query({ query: 'aur', limit: 0 })
            .expect(200)
            .expect([]);
        }, 30_000);
      });

      describe('400 BAD_REQUEST', () => {
        it('query', async () => {
          request.get('/api/v1/search').expect(400);
        }, 30_000);
        it('query', async () => {
          request.get('/api/v1/search').query({ query: '' }).expect(400);
        }, 30_000);
      });
    });
  });

  describe('/api/v2/pokemons', () => {
    describe('GET /', () => {
      let all: PokemonPage;
      let fromDb: GetPokemonDto[];
      let fromJson: GetPokemonDto[];

      beforeAll(async () => {
        all = await service.findAll({});

        fromDb = all.data.map(toPokemon);
        fromJson = pokemons.map(toEntity).map(toPokemon);

        expect(fromJson).toEqual(fromDb);
      });

      describe('200 OK', () => {
        it('sort, limit, offset', async () => {
          request
            .get('/api/v2/pokemons')
            .query({ sortBy: 'name-desc', limit: 7, offset: 13 })
            .expect(200)
            .expect({
              data: fromDb
                .slice(13, 13 + 7)
                .toSorted((a, b) =>
                  a.name < b.name ? 1 : a.name > b.name ? -1 : 0,
                ),
              metadata: {
                total: 7,
                pages: 3,
                page: 1,
                next: 'http://localhost:3000/api/v2/pokemons?sort=name-asc&limit=7&offset=21',
                previous:
                  'http://localhost:3000/api/v2/pokemons?sort=name-asc&limit=7&offset=5',
              },
            });
        }, 30_000);
      });

      describe('400 BAD_REQUEST', () => {
        it('sort', async () => {
          request
            .get('/api/v2/pokemons')
            .query({ sort: 'weight-desc' })
            .expect(400);
        }, 30_000);
        it('limit', async () => {
          request
            .get('/api/v2/pokemons')
            .query({ limit: 'the sky!' })
            .expect(400);
        }, 30_000);
        it('offset', async () => {
          request.get('/api/v2/pokemons').query({ offset: -999 }).expect(400);
        }, 30_000);
      });
    });
  });
});
