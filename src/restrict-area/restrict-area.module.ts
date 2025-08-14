import { Module } from '@nestjs/common';
import { RestrictAreaController } from './restrict-area.controller';
import { RestrictAreaService } from './restrict-area.service';

@Module({
  controllers: [RestrictAreaController],
  providers: [RestrictAreaService]
})
export class RestrictAreaModule {}
