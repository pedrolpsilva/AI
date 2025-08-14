import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';
import { newDate } from './newDate';
import sendNotification from './sendNotification';

@Injectable()
export class verifyCertification {
    constructor(private readonly notificationService: NotificationService) {}
    private readonly targetDate = new Date('2024-03-30')
    @Cron('0 0 * * *')
    async checkDate() {
        const currentDate = new Date()
        const threeDaysBeforeTarget = new Date(this.targetDate)
        const twoDaysBeforeTarget = new Date(this.targetDate)
        const oneDayBeforeTarget = new Date(this.targetDate)
        console.log('CERTIFICADO ----------------', threeDaysBeforeTarget, twoDaysBeforeTarget, oneDayBeforeTarget)
        const tittle = 'Certificado Digital'
        const body = 'O certificado digital da API irá expirar em '

        threeDaysBeforeTarget.setDate(this.targetDate.getDate() - 3)
        if (currentDate.getFullYear() === threeDaysBeforeTarget.getFullYear() && currentDate.getMonth() === threeDaysBeforeTarget.getMonth() && currentDate.getDate() === threeDaysBeforeTarget.getDate() ) {
            const fcms = await this.notificationService.internalAdmNotification(tittle, body + '3 dias!', newDate())
            for (let i = 0; i < fcms.length; i++) {
                sendNotification(fcms[i].fcm, tittle, body + '3 dias!', 'adm')
            }
        } else if ( currentDate.getFullYear() === twoDaysBeforeTarget.getFullYear() && currentDate.getMonth() === twoDaysBeforeTarget.getMonth() && currentDate.getDate() === twoDaysBeforeTarget.getDate() ) {
            const fcms = await this.notificationService.internalAdmNotification(tittle, body + '2 dias!', newDate())
            for (let i = 0; i < fcms.length; i++) {
                sendNotification(fcms[i].fcm, tittle, body + '2 dias!', 'adm')
            }
        } else if ( currentDate.getFullYear() === oneDayBeforeTarget.getFullYear() && currentDate.getMonth() === oneDayBeforeTarget.getMonth() && currentDate.getDate() === oneDayBeforeTarget.getDate() ) {
            const fcms = await this.notificationService.internalAdmNotification(tittle, body + '1 dia!', newDate())
            for (let i = 0; i < fcms.length; i++) {
                sendNotification(fcms[i].fcm, tittle, body + '1 dia!', 'adm')
            }
        }
    }
}