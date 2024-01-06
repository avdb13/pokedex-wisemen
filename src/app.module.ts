import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokemonsModule } from './pokemons/pokemons.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsModule } from './teams/teams.module';
import { join } from 'path';

// TODO: config file for database credentials
@Module({
  imports: [
    PokemonsModule,
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
      logging: true,
    }),
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
