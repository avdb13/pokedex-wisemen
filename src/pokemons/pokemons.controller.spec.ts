import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';
import { pokemons } from './../pokemons';
import { JsonPokemonDto } from './dto/json-pokemon.dto';

describe('PokemonsController', () => {
  let controller: PokemonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonsController],
      providers: [PokemonsService],
    }).compile();

    controller = module.get<PokemonsController>(PokemonsController);
  });

  // it('should work', () => {
  //   expect(controller).toBeDefined();

  //   const sample: JsonPokemonDto = pokemons[0];
  //   controller.createFromJson(sample);
  // });
});
