import { Body, Controller, Post } from '@nestjs/common';
import { RestrictAreaService } from './restrict-area.service';
import { restrictAreaDto } from './dto/restrict-area.dto';

@Controller('restrict_area')
export class RestrictAreaController {
    constructor(private readonly service: RestrictAreaService) {}
    
    @Post('get')
    async restrictArea(@Body() req: restrictAreaDto) {
        const res = await this.service.restrictArea(req.client)
        let newRes = []

        for (let i = 0; i < res.length; i++) {
            let newJson = JSON.parse(res[i].area_json)
            
            let newJsonCoords = []
            for (let y = 0; y < newJson[0].geometry.coordinates[0].length; y++) {
                newJsonCoords.push({
                    latitude: newJson[0].geometry.coordinates[0][y][1],
                    longitude: newJson[0].geometry.coordinates[0][y][0]
                })
            }

            async function newColorFill(color:string) {
                color = color.replace("#", "")

                const r = parseInt(color.substring(0, 2), 16)
                const g = parseInt(color.substring(2, 4), 16)
                const b = parseInt(color.substring(4, 6), 16)

                return `rgba(${r}, ${g}, ${b}, ${0.4})`
            }
            let colorFill = await newColorFill(res[i].color)

            async function centerCoords(coords: {latitude: number, longitude: number}[]) {
                let sumLat = 0, sumLng = 0
                coords.forEach(coord => {
                  sumLat += coord.latitude
                  sumLng += coord.longitude
                })
              
                return {
                  latitude: sumLat / coords.length,
                  longitude: sumLng / coords.length
                }
            }
            let center = await centerCoords(newJsonCoords)

            let newObjectTemp = {
                json: newJsonCoords,
                center: center,
                colorStroke: res[i].color,
                colorFill: colorFill,
                descricao: res[i].descricao,
                id: res[i].id,
                nome: res[i].nome,
                placa: res[i].placa
            }
            newRes.push(newObjectTemp)
        } 
        
        return newRes
    }
}
