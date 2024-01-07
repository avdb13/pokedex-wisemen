import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

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

export interface RequestWithFindOptions extends Request {
  findOptions?: SearchOptions | PokemonOptions;
}

export class QueryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isStr = (s: any): s is string => typeof s === 'string';

    const req = context.switchToHttp().getRequest<RequestWithFindOptions>();
    const { sort, query, limit, offset } = req.query;

    if (query) {
      if (!isStr(query) || (limit && isStr(limit) && isNaN(parseInt(limit)))) {
        throw new BadRequestException();
      }

      req.findOptions = { query, limit } as SearchOptions;
      return true;
    }

    const [sortBy, order] =
      sort && isStr(sort) ? sort.split('-', 2) : [undefined, undefined];

    if (sort) {
      if (isStr(sort)) {
        // check this
        if (!(sortBy! in sortByOptions && order! in orderOptions)) {
          throw new BadRequestException();
        }
      }

      throw new BadRequestException();
    }

    if (limit) {
      if (!isStr(limit) || isNaN(parseInt(limit))) {
        throw new BadRequestException();
      }
    }

    if (offset) {
      if (!isStr(offset) || isNaN(parseInt(offset))) {
        throw new BadRequestException();
      }
    }

    req.findOptions = { sortBy, order, limit, offset } as PokemonOptions;
    return true;
  }
}
