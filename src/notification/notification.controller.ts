import { Body, Controller, Delete, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import sendNotification from 'src/helper/sendNotification';
import { getNotificationDto } from './dto/getNotification.dto';
import { getNotificationPlaceDto } from './dto/getNotificationPlace.dto';
import { delNotificationDto } from './dto/delNotification.dto';
import { admNotificationDto } from './dto/admNotification.dto';
import { newDate } from 'src/helper/newDate';
import { delAllNotificationDto } from './dto/delAllNotification.dto';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('get_notification')
    getNotification(@Body() req: getNotificationDto) {
        return this.notificationService.verify(req.user)
    }

    @Post('get_notificationPlace')
    getNotificationPlace(@Body() req: getNotificationPlaceDto) {
        return this.notificationService.verifyPlace(req.user, req.place)
    }

    @Post('delete')
    delNotification(@Body() req: delNotificationDto) {
        return this.notificationService.delNotification(req.id)
    }

    @Post('delete_all')
    delAllNotification(@Body() req: delAllNotificationDto) {
        return this.notificationService.delAllNotification(req.idUser)
    }

    @Post('adm_notification')
    async admNotification(@Body() req: admNotificationDto) {
        const fcms = await this.notificationService.admNotification(req.body, req.tittle, newDate())

        for (let i = 0; i < fcms.length; i++) {
            sendNotification(fcms[i].fcm, req.tittle, req.body, 'adm')
        }

        return true
    }
}
