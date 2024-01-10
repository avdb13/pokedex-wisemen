import { ArrayMaxSize, IsArray } from 'class-validator';

export class UpdateTeamDto {
  @IsArray()
  @ArrayMaxSize(6)
  pokemons: number[];
}
