import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokemonsModule } from './pokemons/pokemons.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';
import { dataSourceOptions } from './db/ormconfig';

@Module({
  imports: [
    PokemonsModule,
    TeamsModule,
    UsersModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    TeamsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
