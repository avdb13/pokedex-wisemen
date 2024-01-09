import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    // save fine here since our DTO is small
    return this.usersRepository.save(createUserDto);
  }

  findAll() {
    return this.usersRepository.find({});
  }

  findOne(id: number) {
    return this.usersRepository.findBy({ id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    // save makes sure we can only change email and password
    return this.usersRepository.save({ ...updateUserDto, id });
  }

  remove(id: number) {
    return this.usersRepository.delete({ id });
  }
}
