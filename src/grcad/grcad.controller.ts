import { Body, Controller, Post } from '@nestjs/common';
import { odometerMask, removePoints } from 'src/mask/odometer';
import { GrcadService } from './grcad.service';
import { monitoringDto } from './dto/monitoring.dto';
import { positionDto } from './dto/position.dto';
import { detailDto } from './dto/detail.dto';
import { historyDto } from './dto/history.dto';
import { historyDetailDto } from './dto/historyDetail.dto';
import { commandDto } from './dto/command.dto';
import { reportCommandDto } from './dto/reportCommand.dto';
import { newDate } from 'src/helper/newDate';
import { AuthService } from 'src/auth/auth.service';

@Controller('grcad')
export class GrcadController {
    constructor(private readonly service: GrcadService, private readonly authService: AuthService) {}
    
    @Post('monitoring')
    async monitoring(@Body() req: monitoringDto) {
        const result = await this.service.monitoring(req.place)

        return {
          dataGPS: result[0].dataGPS,
          placa: result[0].placa,
          etiqueta: result[0].etiqueta,
          coords: {latitude: parseFloat(result[0].latitude), longitude: parseFloat(result[0].longitude)},
          localizacao: result[0].localizacao,
          velocidade: result[0].velocidade,
          ignicao: result[0].ignicao,
          statusVeic: result[0].statusVeic,
          odometro: await odometerMask(result[0].odometro),
          tensao: result[0].tensao,
          referenciaNome: result[0].referenciaNome ?? null,
        }
    }

    @Post('position')
    async position(@Body() req: positionDto) {
        var clientTemp = [],  client
        if (req.client == undefined) {
            const clients = await this.authService.getUserClients(String(req.user))
            for (let i = 0; i < clients.length; i++) {
                clientTemp.push(clients[i].id)
            }
        }
        client = clientTemp.toString().split(',')
        let res = await this.service.position(req.profile, req.user, req.client == undefined ? client : req.client)
        for (let i = 0; i < res.length; i++) {
            res[i].favorito = false
            res[i].coords = {
                latitude: parseFloat(res[i].latitude),
                longitude: parseFloat(res[i].longitude)
            }
        }
        return res
    }

    @Post('detail')
    async detail(@Body() req: detailDto) {
        const result = await this.service.detail(req.place)
        let newResult = result[0]
        newResult.odometro = await odometerMask(newResult.odometro)
        newResult.coords = {
            latitude: parseFloat(newResult.latitude),
            longitude: parseFloat(newResult.longitude)
        }

        return newResult
    }

    @Post('history')
    async history(@Body() req: historyDto) {
        let newResult = []
        const result = await this.service.history(req.place, req.dateI, req.dateF)
        let newTempResult = result
        for (let i = 0; i < newTempResult.length; i++) {
            newTempResult[i].odometro = await removePoints(newTempResult[i].odometro)
            newResult.push(newTempResult[i])
            newTempResult[i].coords = {
                latitude: parseFloat(newTempResult[i].latitude),
                longitude: parseFloat(newTempResult[i].longitude)
            }
        }

        return newResult
    }

    @Post('history_detail')
    async historyDetail(@Body() req: historyDetailDto) {
        const result = await this.service.historyDetail(req.place, req.date)
        if (result.length > 0) {
            let newResult = result
            newResult[0].odometro = await odometerMask(newResult[0].odometro)
            return newResult
        } else {
            return result
        }
    }

    @Post('command')
    async command(@Body() req: commandDto) {
        let commandName = ''

        if(req.command.includes('250')){
            commandName = 'Desativar imobilizador';
        }else if(req.command.includes('63')){
            commandName = 'Ativar imobilizador';
        }

        return this.service.command(newDate(), commandName, req.place, req.idClient, req.idUser, req.command, Math.floor(Math.random() * 10000) + 1)
    }

    @Post('report_command')
    reportCommand(@Body() req: reportCommandDto) {
        let places = "'" + req.places.toString().replaceAll(',',"','") + "'"
        return this.service.reportCommand(places, req.dateI, req.dateF)
    }
}
