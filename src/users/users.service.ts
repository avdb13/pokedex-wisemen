import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // save fine here since our DTO is small
    const { password: plain, ...rest } = createUserDto;
    const password = await bcrypt.hash(plain, 10);

    return this.usersRepository.save({ ...rest, password });
  }

  async login(loginUserDto: LoginUserDto) {
    const { identifier, password } = loginUserDto;

    const user = await this.usersRepository.findOne({
      where: [{ name: identifier }, { email: identifier }],
      select: { password: true },
    });

    if (!user) {
      throw new BadRequestException();
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException();
    }
    const { password: _, ...rest } = user;

    return rest;
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
