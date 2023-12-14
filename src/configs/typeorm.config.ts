import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (): TypeOrmModuleOptions => {
  if (!process.env.DB_USERNAME) {
    throw new Error('DB_USERNAME not found');
  }

  if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD not found');
  }

  if (!process.env.DB_DATABASE) {
    throw new Error('DB_DATABASE not found');
  }

  if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV not found');
  }

  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: process.env.NODE_ENV === 'production' ? false : true,
  };
};
