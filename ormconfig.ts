import { DataSource } from 'typeorm';
import 'dotenv/config';

export const dataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) ?? 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/dist/database/migrations/*{.ts,.js}'],
  synchronize: true,
  logging: true,
  extra: {
    trustServerCertificate: true,
  },
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  migrationsRun: true,
});
