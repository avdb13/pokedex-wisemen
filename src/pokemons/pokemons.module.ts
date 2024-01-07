import { Module } from '@nestjs/common';
import { PokemonsService } from './pokemons.service';
import {
  PokemonDetailsController,
  PokemonsController,
  SearchController,
} from './pokemons.controller';
import { Pokemon } from './entities/pokemon.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Pokemon])],
  controllers: [PokemonsController, SearchController, PokemonDetailsController],
  providers: [PokemonsService],
})
export class PokemonsModule {}
