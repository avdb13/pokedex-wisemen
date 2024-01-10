import { Injectable } from '@nestjs/common';
import CreateTeamDto from './dto/create-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private teamsRepository: Repository<Team>,
  ) {}

  create({ name }: CreateTeamDto) {
    const team = new Team();
    team.name = name;

    return this.teamsRepository.save(team);
  }

  createMany(createTeamDto: CreateTeamDto[]) {
    const teams = createTeamDto.map(({ name }) => {
      const team = new Team();

      team.name = name;

      return team;
    });

    return this.teamsRepository.save(teams);
  }

  findAll() {
    return this.teamsRepository.find({ order: { id: 'ASC' } });
  }

  findOne(id: number) {
    return this.teamsRepository.findOneBy({ id });
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
