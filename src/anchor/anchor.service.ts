import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AnchorService {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}
    
    anchor(place: string) {
        return this.connection.query(`
            SELECT
                id,
                placa,
                dataGPS,
                idCliente,
                localizacao,
                tipoRaio,
                raio,
                longitude,
                latidute,
                ancorado
            FROM ancora
            WHERE placa='${place}'
                AND ancorado=1
      `)
    }

    anchors(places: string) {
        return this.connection.query(`
            SELECT * FROM 
                ( SELECT DISTINCT
                    *,
                    ROW_NUMBER() OVER (PARTITION BY placa ORDER BY dataGPS DESC ) AS RowNumber
                FROM ancora
                WHERE placa in ('${places.toString().replaceAll(',',"','")}')
                    AND ancorado=1
                ) AS a
            WHERE a.RowNumber = 1
        `)
    }

    async updateAnchor(id: number) {
        await this.connection.query(`
            UPDATE ancora
            SET ancorado = 0
            WHERE id = ${id}
        `)
        return true
    }

    async insertAnchor(idVehicle: string, place: string, date: string, idClient: string, location: string, type: string, radius: string, lat: number, lon: number) {
        await this.connection.query(`
            INSERT INTO ancora (idVeiculo, placa, dataGPS, idCliente, localizacao, tipoRaio, raio, longitude, latidute, ancorado) 
            VALUES ('${idVehicle}', '${place}', '${date}', ${idClient}, '${location}', '${type}', '${radius}', '${lon}', '${lat}', 'true')
        `)
        return true
    }
}
