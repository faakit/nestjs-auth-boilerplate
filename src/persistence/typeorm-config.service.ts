import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const username = this.configService.get<string>('DB_USERNAME');
    const password = this.configService.get<string>('DB_PASSWORD');
    const database = this.configService.get<string>('DB_DATABASE');
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (!username) {
      throw new Error('DB_USERNAME not found');
    }

    if (!password) {
      throw new Error('DB_PASSWORD not found');
    }

    if (!database) {
      throw new Error('DB_DATABASE not found');
    }

    if (!nodeEnv) {
      throw new Error('NODE_ENV not found');
    }

    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 3306),
      username,
      password,
      database,
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: false,
      ssl:
        nodeEnv === 'production'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    };
  }
}
