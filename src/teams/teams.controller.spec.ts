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

import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { UsersModule } from './../users/users.module';

// can't use ES6 import?
import supertest = require('supertest');

describe('teams', () => {
  let app: INestApplication;
  let service: TeamsService;
  let request: supertest.SuperTest<supertest.Test>;

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
          .expect(204),
      ),
    );
  });

  describe('/api/v1/teams', () => {
    describe('GET /', () => {
      let all: Team[];
      let fromDb: Team[];
      let fromJson: Team[];

      beforeAll(async () => {
        all = await service.findAll();

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

    describe('GET /{id}', () => {
      let one: Team | null;
      let fromDb: Team | null;
      let fromJson: Team | null;

      beforeAll(async () => {
        one = await service.findOne(2);

        fromDb = one;
        fromJson = teams[1];

        expect(fromJson).toEqual(fromDb);
      });

      describe('200 OK', () => {
        it('', async () => {
          request.get('/api/v1/teams').expect(200).expect(fromDb!);
        }, 30_000);
      });
    });

    describe('POST /', () => {
      describe('201 CREATED', () => {
        it('', async () => {
          await request
            .post('/api/v1/teams')
            .send({ name: 'Team Rocket' })
            .expect(201);

          const fromDb = await service.findOne(teams.length + 1);
          expect({
            id: teams.length + 1,
            name: 'Team Rocket',
            pokemons: [],
          }).toEqual(fromDb);
        }, 30_000);
      });
    });

    describe('POST /{id}', () => {
      describe('204 NO_CONTENT', () => {
        it('', async () => {
          const newTeam = { ...teams[2], pokemons: [1, 1, 3] };
          await request.post(`/api/v1/teams/${3}`).send(newTeam).expect(204);

          const fromDb = await service.findOne(3);
          expect(newTeam).toEqual(fromDb);
        }, 30_000);
      });
    });
  });
});
