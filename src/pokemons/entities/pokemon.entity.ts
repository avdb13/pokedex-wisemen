import {
  Relation,
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { CreatePokemonDto, NoNull } from '../dto/create-pokemon.dto';
import { Details, Relations } from '../pokemons.service';

abstract class NameAndUrl {
  @Column()
  name: string;

  @Column()
  url: string;
}

@Entity({ name: 'pokemon' })
export class Pokemon {
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToMany(() => Ability, (ability) => ability.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  abilities: Relation<Ability[]>;

  @Column()
  base_experience: number;

  // seems to always be of length one so let's inline it
  @Column(() => NameAndUrl)
  form: NameAndUrl;

  @OneToMany(() => GameIndex, (gameIndex) => gameIndex.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  game_indices: Relation<GameIndex[]>;

  @Column()
  height: number;

  // many-to-many since there's a finite number of items
  @OneToMany(() => Item, (item) => item.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  held_items: Relation<Item[]>;

  @Column()
  is_default: boolean;

  @Column()
  location_area_encounters: string;

  @OneToMany(() => Move, (move) => move.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  moves: Relation<Move[]>;

  @Column()
  order: number;

  @Column(() => NameAndUrl)
  // all species arrays are of length one in our data
  species: NameAndUrl;

  @OneToMany(() => Sprite, (sprite) => sprite.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  sprites: Relation<Sprite[]>;

  @OneToMany(() => Stat, (stat) => stat.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  stats: Relation<Stat[]>;

  @OneToMany(() => Kind, (type) => type.pokemon, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  types: Relation<Kind[]>;

  @Column()
  weight: number;

  public fromDto(pokemon: CreatePokemonDto) {
    const {
      id,
      base_experience,
      height,
      is_default,
      location_area_encounters,
      order,
      species,
      weight,
    } = pokemon;

    this.id = id;
    this.base_experience = base_experience;
    this.height = height;
    this.is_default = is_default;
    this.location_area_encounters = location_area_encounters;
    this.order = order;
    this.species = species;
    this.weight = weight;
    this.form = pokemon.forms[0];
  }

  public createRelations(pokemon: CreatePokemonDto): Relations {
    const abilities = pokemon.abilities.map(({ ability, ...rest }) => ({
      ...ability,
      ...rest,
      pokemon: this,
    }));

    const game_indices = pokemon.game_indices.map(
      ({ version, game_index }) => ({
        ...version,
        value: game_index,
        pokemon: this,
      }),
    );

    const held_items = pokemon.held_items.map(
      ({ item: rest, version_details: _ }) => {
        let item = new Item();

        item = {
          pokemon: this,
          ...rest,
          version_details: [],
        };

        return item;
      },
    );

    const moves = pokemon.moves.map(
      ({ move: rest, version_group_details: _ }) => {
        let move = new Move();
        move = {
          ...rest,
          pokemon: this,
          version_group_details: [],
        };

        return move;
      },
    );

    const { other, versions, ...baseSprites } = pokemon.sprites;

    const spritesByVersion = Object.entries(versions).flatMap(
      ([_generation, sprites]) =>
        Object.entries(sprites).flatMap(([title, spriteMap]) =>
          spriteMap.animated
            ? [
                {
                  ...(spriteMap as NoNull<SpriteMap>),
                  pokemon: this,
                  title,
                  is_icons: title === 'icons',
                },
                {
                  ...(spriteMap.animated as NoNull<SpriteMap>),
                  is_animated: true,
                  pokemon: this,
                  title,
                },
              ]
            : [
                {
                  ...(spriteMap as NoNull<SpriteMap>),
                  pokemon: this,
                  title,
                  is_icons: title === 'icons',
                },
              ],
        ),
    );

    const otherSprites = Object.entries(other).map(([title, spriteMap]) => ({
      ...(spriteMap as NoNull<SpriteMap>),
      pokemon: this,
      isOther: true,
      title,
    }));

    const sprites = [
      { ...baseSprites, pokemon },
      ...spritesByVersion,
      ...otherSprites,
    ] as Sprite[];

    const stats = pokemon.stats.map(({ stat, effort, base_stat }) => ({
      ...stat,
      effort,
      base_stat,
      pokemon: this,
    }));

    const types = pokemon.types.map(({ slot, type }) => ({
      ...type,
      slot,
      pokemon: this,
    }));

    return {
      abilities,
      game_indices,
      held_items,
      moves,
      sprites,
      stats,
      types,
    };
  }

  public getRelations(): Relations {
    const {
      abilities,
      game_indices,
      held_items,
      moves,
      sprites,
      stats,
      types,
    } = this;

    return {
      abilities,
      game_indices,
      held_items,
      moves,
      sprites,
      stats,
      types,
    };
  }

  public updateRelations(relations: Relations) {
    const {
      abilities,
      game_indices,
      held_items,
      moves,
      sprites,
      stats,
      types,
    } = relations;

    this.abilities = abilities;
    this.game_indices = game_indices;
    this.held_items = held_items;
    this.moves = moves;
    this.sprites = sprites;
    this.stats = stats;
    this.types = types;
  }

  public getDetails(): Details {
    return {
      version_details: this.held_items.flatMap(
        ({ version_details }) => version_details,
      ),
      version_group_details: this.moves.flatMap(
        ({ version_group_details }) => version_group_details,
      ),
    };
  }

  public createDetails(pokemon: CreatePokemonDto): Details {
    const held_items = pokemon.held_items.map(
      ({ item: rest, version_details }) => {
        let item = new Item();

        item = {
          pokemon: this,
          ...rest,
          version_details: version_details.map(({ version, ...rest }) => ({
            ...version,
            ...rest,
            item,
          })),
        };

        return item;
      },
    );

    const moves = pokemon.moves.map(({ move: rest, version_group_details }) => {
      let move = new Move();
      move = {
        ...rest,
        pokemon: this,
        version_group_details: version_group_details.map((details) => ({
          ...details,
          move,
        })),
      };

      return move;
    });

    return {
      version_details: held_items.flatMap(
        ({ version_details }) => version_details,
      ),
      version_group_details: moves.flatMap(
        ({ version_group_details }) => version_group_details,
      ),
    };
  }

  public updateDetails({ version_details, version_group_details }: Details) {
    this.moves = this.moves.map((v, i) => ({
      ...v,
      version_details: version_details[i],
    }));
    this.held_items = this.held_items.map((v, i) => ({
      ...v,
      version_group_details: version_group_details[i],
    }));
  }
}

@Entity({ name: 'abilities' })
export class Ability extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  is_hidden: boolean;

  @Column()
  slot: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.abilities)
  @Index()
  pokemon: Relation<Pokemon>;
}

@Entity({ name: 'game_indices' })
export class GameIndex extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  value: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.game_indices)
  @Index()
  pokemon: Relation<Pokemon>;
}

@Entity({ name: 'version_details' })
export class ItemVersionDetails extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  rarity: number;

  @ManyToOne(() => Item, (item) => item.version_details)
  @Index()
  item?: Relation<Item>;
}

@Entity({ name: 'held_items' })
export class Item extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.held_items)
  @Index()
  pokemon: Relation<Pokemon>;

  @OneToMany(() => ItemVersionDetails, (details) => details.item, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  version_details: Relation<ItemVersionDetails[]>;
}

@Entity({ name: 'version_group_details' })
export class MoveVersionDetails {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  level_learned_at: number;

  @Column(() => NameAndUrl)
  move_learn_method: NameAndUrl;

  @Column(() => NameAndUrl)
  version_group: NameAndUrl;

  @ManyToOne(() => Move, (move) => move.version_group_details)
  @Index()
  move?: Relation<Move>;
}

@Entity({ name: 'moves' })
export class Move extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.moves)
  @Index()
  pokemon: Relation<Pokemon>;

  // optional so that we can save this last
  @OneToMany(() => MoveVersionDetails, (details) => details.move, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  version_group_details: Relation<MoveVersionDetails[]>;
}

export abstract class SpriteMap {
  @Column({ type: 'varchar' })
  front_default: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_female?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_shiny?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  front_shiny_female?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_default?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_female?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_shiny?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  back_shiny_female?: string;
}

@Entity({ name: 'sprites' })
export class Sprite extends SpriteMap {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  @Index()
  pokemon: Relation<Pokemon>;

  @Column({ type: 'varchar', nullable: true, default: null })
  title?: string;

  @Column({ nullable: true, default: false })
  is_other?: boolean;

  @Column({ nullable: true, default: false })
  is_animated?: boolean;

  @Column({ nullable: true, default: false })
  is_icons?: boolean;
}

@Entity({ name: 'types' })
export class Kind extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.types)
  @Index()
  pokemon: Relation<Pokemon>;

  @Column()
  slot: number;
}

@Entity({ name: 'stats' })
export class Stat extends NameAndUrl {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToOne(() => Pokemon, (pokemon) => pokemon.sprites)
  @Index()
  pokemon: Relation<Pokemon>;

  @Column()
  base_stat: number;

  @Column()
  effort: number;
}

const generationRecord = {
  1: ['red-blue', 'yellow'],
  2: ['crystal', 'gold', 'silver'],
  3: ['emerald', 'firered-leafgreen', 'ruby-sapphire'],
  4: ['diamond-pearl', 'heartgold-soulsilver', 'platinum'],
  5: ['black-white'],
  6: ['omegaruby-alphasapphire', 'x-y'],
  7: ['ultra-sun-ultra-moon'],
  8: [],
} as const satisfies Record<number, string[]>;

export const titles = Object.values(generationRecord).flatMap(
  (x) => x as string[],
);

export type Title =
  (typeof generationRecord)[keyof typeof generationRecord][number];
