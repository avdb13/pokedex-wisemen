import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  // name or email
  identifier: string;

  @IsNotEmpty()
  password: string;
}
