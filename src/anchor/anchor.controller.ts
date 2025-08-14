import { Body, Controller, Post, Put } from '@nestjs/common';
import { AnchorService } from './anchor.service';
import { anchorDto } from './dto/anchor.dto';
import { anchorsDto } from './dto/anchors.dto';
import { updateAnchorDto } from './dto/updateAnchor.dto';
import { insertAnchorDto } from './dto/insertAnchor.dto';
import { newDate } from 'src/helper/newDate';

@Controller('anchor')
export class AnchorController {
    constructor(private readonly service: AnchorService) {}
    
    @Post('anchor')
    anchor(@Body() req: anchorDto) {
        return this.service.anchor(req.place)
    }

    @Post('anchors')
    anchors(@Body() req: anchorsDto) {
        return this.service.anchors(req.places)
    }
    
    @Post('update')
    updateAnchor(@Body() req: updateAnchorDto) {
        return this.service.updateAnchor(req.id)
    }

    @Post('insert')
    async insertAnchor(@Body() req: insertAnchorDto) {
        return this.service.insertAnchor(req.idVehicle, req.place, newDate(), req.idClient, req.location, req.type, req.radius, req.lat, req.lon)
    }
    
}
