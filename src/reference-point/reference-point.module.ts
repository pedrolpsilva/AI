import { Module } from '@nestjs/common';
import { ReferencePointController } from './reference-point.controller';
import { ReferencePointService } from './reference-point.service';

@Module({
  controllers: [ReferencePointController],
  providers: [ReferencePointService]
})
export class ReferencePointModule {}
