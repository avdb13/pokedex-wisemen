import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import CreateTeamDto from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('/api/v1/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Post(':id')
  async set(@Param('id') id: string, @Body() { pokemons }: UpdateTeamDto) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new BadRequestException();
    }

    const result = await this.teamsService.update(numericId, pokemons);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(+id);
  }
}
