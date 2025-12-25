import { Module } from '@nestjs/common';
import { LunchesController } from './lunches.controller';
import { LunchesService } from './lunches.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [LunchesController],
  providers: [LunchesService],
  exports: [LunchesService],
})
export class LunchesModule {}
