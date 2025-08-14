import { Body, Controller, Post } from '@nestjs/common';
import { TruckService } from './truck.service';
import { fuelUpdateDto } from './dto/fuelUpdate.dto';
import { fuelDto } from './dto/fuel.dto';
import { regraOperacaoTrucksDto } from './dto/regraOperacaoTrucks.dto';

@Controller('truck')
export class TruckController {
    constructor(private readonly service: TruckService) {}
    
    @Post('fuel')
    fuel(@Body() req: fuelDto) {
        return this.service.fuel(req.place)
    }

    @Post('fuel_update')
    fuelUpdate(@Body() req: fuelUpdateDto) {
        return this.service.fuelUpdate(req.type, req.value, req.km, req.place)
    }

    @Post('regra_operacao_trucks')
    async regraOperacaoTrucks(@Body() req: regraOperacaoTrucksDto) {
        let places = "'" + req.places.toString().replaceAll(',',"','") + "'"
        const res = await this.service.regraOperacaoTrucks(places)
        return res
    }
}
