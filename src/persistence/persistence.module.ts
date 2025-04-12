import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './typeorm-config.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [TypeOrmConfigService],
      useClass: TypeOrmConfigService,
    }),
    DatabaseModule,
  ],
  exports: [],
})
export class PersistenceModule {}
