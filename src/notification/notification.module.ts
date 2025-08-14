import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
  imports: [ScheduleModule.forRoot()]
})
export class NotificationModule {}
