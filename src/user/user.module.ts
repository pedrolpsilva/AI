import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ServicesService } from 'src/services/services.service';
import { NotificationService } from 'src/notification/notification.service';
import { ServicesController } from 'src/services/services.controller';
import { NotificationController } from 'src/notification/notification.controller';

@Module({
  providers: [UserService, ServicesService],
  controllers: [UserController, ServicesController]
})
export class UserModule {}
