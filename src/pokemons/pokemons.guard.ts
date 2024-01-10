import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  mixin,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

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
const isPositiveNum = (n: any): n is number =>
  isStr(n) && !isNaN(parseInt(n)) && parseInt(n) >= 0;

// we just need to know if it's a search to make query mandatory
export function QueryGuard(search: boolean) {
  class BaseGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): Observable<boolean> | Promise<boolean> | boolean {
      let req = context.switchToHttp().getRequest<Request>();
      const { sort, query, limit, offset } = req.query;

      // can we do better?
      const [sortBy, order] =
        sort && isStr(sort) ? sort.split('-', 2) : [undefined, undefined];

      if (sort) {
        if (
          !(sortBy && sortBy in sortByOptions && order && order in orderOptions)
        ) {
          throw new BadRequestException({
            error: 'query parameters',
            error_message: `sortBy must be one of: ['id-asc','id-desc', 'name-asc', 'name-desc']`,
          });
        }
      }

      if (limit) {
        if (!isPositiveNum(limit)) {
          throw new BadRequestException({
            error: 'query parameters',
            error_message: 'limit must be a number',
          });
        }
      }

      if (offset) {
        if (!isPositiveNum(offset)) {
          throw new BadRequestException({
            error: 'query parameters',
            error_message: 'offset must be a number',
          });
        }
      }

      if (search && (!query || !isStr(query) || query.length === 0)) {
        throw new BadRequestException({
          error: 'query parameters',
          error_message:
            'query must be provided, be a string and its length bigger than zero',
        });
      }

      req = {
        ...req,
        findOptions: search
          ? { query, limit, offset }
          : { sortBy, order, limit, offset },
      } as RequestWithFindOptions;

      return true;
    }
  }

  return mixin(BaseGuard);
}
