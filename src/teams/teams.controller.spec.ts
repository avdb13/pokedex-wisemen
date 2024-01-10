import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { json } from 'express';
import { join } from 'path';

import { Team } from './entities/team.entity';

const teams: Team[] = [
  {
    name: 'Team Magma',
    pokemons: [1, 3],
  },
  {
    name: 'Team Aqua',
    pokemons: [4, 8, 2, 12],
  },
  {
    name: 'Team Rocket',
    pokemons: [3, 5, 7],
  },
].map((t, i) => ({ ...t, id: i + 1 }));
console.log(teams);

// import { CreatePokemonDto } from './dto/create-pokemon.dto';
// import { GetPokemonDetailsDto, GetPokemonDto } from './dto/get-pokemon';
// import { Pokemon } from './entities/pokemon.entity';
// import { PokemonsController } from './pokemons.controller';
// import {
//   PokemonDetailsInterceptor,
//   toPokemon,
//   toPokemonDetails,
// } from './pokemons.interceptor';
// import { PokemonsService } from './pokemons.service';

// can't use ES6 import?
import supertest = require('supertest');
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import GetTeamDto from './dto/get-team.dto';
import { UsersModule } from './../users/users.module';

describe('teams', () => {
  let app: INestApplication;
  let service: TeamsService;
  let request: supertest.SuperTest<supertest.Test>;
  // // [ '0', '1', '2', '3', 'default' ] ?
  // const pokemons: CreatePokemonDto[] = Object.values(pokemonsJson)
  //   .map((obj, i) => ({ ...obj, id: i + 1 }))
  //   .slice(0, -1);

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
          dropSchema: true,
          logging: ['error'],
        }),
        TypeOrmModule.forFeature([Team]),
        UsersModule,
      ],

      controllers: [TeamsController],
      providers: [TeamsService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(json({ limit: '10mb' }));
    await app.init();

    service = app.get<TeamsService>(TeamsService);
    request = supertest(app.getHttpServer());

    await request
      .post('/api/v1/teams')
      .send(teams)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(201);

    await Promise.all(
      teams.map(({ id, pokemons }) =>
        request
          .post(`/api/v1/teams/${id}`)
          .send({ pokemons })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(201),
      ),
    );
  });

  describe('/api/v1/teams', () => {
    describe('GET /', () => {
      let all: Team[];
      let fromDb: GetTeamDto[];
      let fromJson: GetTeamDto[];

      beforeAll(async () => {
        all = await service.findAll();
        console.log('all', all);

        fromDb = all;
        fromJson = teams;

        expect(fromJson).toEqual(fromDb);
      });

      describe('200 OK', () => {
        it('', async () => {
          request.get('/api/v1/teams').expect(200).expect(fromDb);
        }, 30_000);
      });
    });
  });
});
