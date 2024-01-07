import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

// useless, we need to define each switch separately anyway
// type SortBy = keyof Pokemon extends infer K extends number | string ? K : never;

const sortByOptions = ['name', 'id'] as const;
const orderOptions = ['asc', 'desc'] as const;

export type PokemonOptions = {
  sortBy?: (typeof sortByOptions)[number];
  order?: (typeof orderOptions)[number];
  limit?: number;
  offset?: number;
};

export type SearchOptions = {
  query: string;
  limit?: number;
};

export type FindOptions = PokemonOptions | SearchOptions;

export interface RequestWithFindOptions extends Request {
  findOptions?: FindOptions;
}

const isStr = (s: any): s is string => typeof s === 'string';
const isNum = (n: any): n is number => isStr(n) && !isNaN(parseInt(n));

export class PokemonsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let req = context.switchToHttp().getRequest<Request>();
    const { sort, limit, offset } = req.query;

    // can we do better?
    const [sortBy, order] =
      sort && isStr(sort) ? sort.split('-', 2) : [undefined, undefined];

    if (sort) {
      if (isStr(sort)) {
        // check this later
        if (!(sortBy! in sortByOptions && order! in orderOptions)) {
          throw new BadRequestException();
        }
      }

      throw new BadRequestException();
    }

    if (limit) {
      if (!isNum(limit)) {
        throw new BadRequestException();
      }
    }

    if (offset) {
      if (!isNum(offset)) {
        throw new BadRequestException();
      }
    }

    req = {
      ...req,
      findOptions: { sortBy, order, limit, offset },
    } as RequestWithFindOptions;

    return true;
  }
}

export class SearchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let req = context.switchToHttp().getRequest<Request>();
    const { query, limit, offset } = req.query;

    if (!query || !isStr(query)) {
      throw new BadRequestException();
    }

    if (limit) {
      if (isNum(limit)) {
        throw new BadRequestException();
      }
    }

    if (offset) {
      if (!isStr(offset) || isNaN(parseInt(offset))) {
        throw new BadRequestException();
      }
    }

    req = {
      ...req,
      findOptions: { query, limit, offset } as SearchOptions,
    } as RequestWithFindOptions;

    return true;
  }
}
