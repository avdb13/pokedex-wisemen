import { Type } from 'class-transformer';
import {
  IsAlpha,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';

const sortOptions = ['name', 'id'].flatMap((s) =>
  ['asc', 'desc'].map((o) => s + o),
);
export class FindOptionsDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class SearchOptionsDto extends FindOptionsDto {
  @IsNotEmpty()
  @IsAlpha()
  query: string;
}

export class PokemonOptionsDto extends FindOptionsDto {
  @IsIn(sortOptions)
  @IsOptional()
  sort?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
