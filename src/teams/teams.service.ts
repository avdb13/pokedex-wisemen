import { Injectable } from '@nestjs/common';
import { UpdateTeamDto } from './dto/update-team.dto';
import CreateTeamDto from './dto/create-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private teamsRepository: Repository<Team>,
  ) {}

  create({ name }: CreateTeamDto) {
    const team = this.teamsRepository.create();
    team.name = name;

    return this.teamsRepository.save(team);
  }

  findAll() {
    return this.teamsRepository.find();
  }

  findOne(id: number) {
    return this.teamsRepository.findBy({ id });
  }

  async update(id: number, pokemonArr: number[]) {
    const team = await this.teamsRepository.findOneBy({ id });

    if (!team) {
      return null;
    }

    const newTeam: Team = { ...team, pokemons: pokemonArr };
    // we could use update but save works just fine
    return this.teamsRepository.save(newTeam);
  }
}
