import { Body, Controller, Delete, Post } from '@nestjs/common';
import { ServicesService } from './services.service';
import { updateLoginDto } from './dto/updateLogin.dto';
import { deleteLoginDto } from './dto/deleteLogin.dto';
import { versionDto } from './dto/version.dto';
import { newDate } from 'src/helper/newDate';

@Controller('services')
export class ServicesController {
    constructor(private readonly serviceService: ServicesService) {}

    @Post('update_login')
    async updateLogin(@Body() req: updateLoginDto) {
        await this.serviceService.updateLogin(req.user, req.fcm, newDate())
        return true
    }

    @Delete('delete_login')
    async deleteLogin(@Body() req: deleteLoginDto) {
        await this.serviceService.deleteLogin(req.fcm)
        return true
    }

    @Post('version')
    async verifyVersion(@Body() req: versionDto) {
        const version = await this.serviceService.verifyVersion(req.os, req.deviceVersion)
        return version
    }
}
