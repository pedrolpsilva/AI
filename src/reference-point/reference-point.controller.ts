import { Body, Controller, Delete, Post, Put } from '@nestjs/common';
import { ReferencePointService } from './reference-point.service';
import { classificationDto } from './dto/classification.dto';
import { referenceDto } from './dto/reference.dto';
import { referencesDto } from './dto/references.dto';
import { deleteDto } from './dto/delete.dto';
import { updateDto } from './dto/update.dto';
import { insertDto } from './dto/insert.dto';

@Controller('reference_point')
export class ReferencePointController {
    constructor(private readonly service: ReferencePointService) {}
    
    @Post('classification')
    async classification(@Body() req: classificationDto) {
        return this.service.classification(req.client)
    }
    
    @Post('reference')
    async reference(@Body() req: referenceDto) {
        return this.service.reference(req.id)
    }

    @Post('references')
    async references(@Body() req: referencesDto) {
        return this.service.references(req.client)
    }

    @Post('delete')
    async deleteReference(@Body() req: deleteDto) {
        return this.service.deleteReference(req.id)
    }

    @Post('update')
    async updateReference(@Body() req: updateDto) {
        return this.service.updateReference(req.id, req.name, req.lat, req.lon, req.radius)
    }

    @Post('insert')
    async insertReference(@Body() req: insertDto) {
        return this.service.insertReference(req.clientId, req.clientName, req.name, req.lat, req.lon, req.classification, req.radius)
    }
}
