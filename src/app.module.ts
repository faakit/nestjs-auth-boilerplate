import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { environmentConfig } from './shared/config/environment';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './persistence/typeorm-config.service';
import { PassportModule } from '@nestjs/passport';
import { ApiModule } from './api/api.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environmentConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ApiModule,
    PersistenceModule,
  ],
})
export class AppModule {}
