export class Pokemon {
  abilities: Ability[];
  forms: Form[];
  game_indices: GameIndex[];
  held_items: Item[];
  moves: Move[];
  pastTypes: never;
  species: Species;
  sprites: Sprite[];
  stats: Stat[];
  types: Kind[];
}

const toAbility = (ability: JsonAbilityDto): Ability => {
  return {};
};

// type Ability = {
//   ability: {
//     name: string;
//     url: string;
//   };
//   is_hidden: boolean;
//   slot: number;
// };

// @Entity()
// export class Ability extends NameAndUrl {
//   @Column()
//   is_hidden: boolean;

//   @Column()
//   slot: number;

//   @ManyToOne(() => Pokemon, (pokemon) => pokemon.abilities)
//   pokemon: Pokemon;
// }
