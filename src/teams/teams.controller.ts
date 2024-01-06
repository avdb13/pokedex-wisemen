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

  @Get()
  findAll() {
    return this.teamsService.findAll();
  }

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new BadRequestException();
    }

    const result = this.teamsService.findOne(numericId);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() { pokemons }: UpdateTeamDto) {
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
}
