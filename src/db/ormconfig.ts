import { DataSourceOptions, DataSource } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '', 10) ?? 5432,
  username: process.env.DB_USERNAME ?? 'pokedex',
  password: process.env.DB_PASSWORD ?? 'pokedex',
  database: process.env.DB_NAME ?? 'pokedex',
  logging: ['error'],
  entities: ['dist/**/entities/*.{js,ts}'],
  migrations: ['dist/migrations/*.{js,ts}'],
  migrationsRun: true,
  synchronize: false,
  cache: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
