import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
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
  async create(@Body() createTeamDto: CreateTeamDto | Array<CreateTeamDto>) {
    return Array.isArray(createTeamDto)
      ? await this.teamsService.createMany(createTeamDto)
      : await this.teamsService.create(createTeamDto);
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    const result = this.teamsService.findOne(id);
    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @Post(':id')
  @HttpCode(204)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id')
    id: number,
    @Body() { pokemons }: UpdateTeamDto,
  ) {
    const result = await this.teamsService.update(id, pokemons);

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}
