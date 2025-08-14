import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReferencePointService {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}
    
    classification(clientId: string) {
        return this.connection.query(`
            SELECT
                id,
                nome
            FROM classificacao
            WHERE idCliente in ('${clientId.toString().replaceAll(',',"','")}')
            ORDER BY nome ASC
      `)
    }

    reference(id: number) {
        return this.connection.query(`
            SELECT
                id,
                cliente,
                nomeReferencia,
                latitude,
                longitude,
                classificacao,
                localizacao,
                raio
            FROM ponto_referencia
            WHERE id = ${id}
        `)
    }
    
    references(clientId: string) {
        return this.connection.query(`
            SELECT
                id,
                cliente,
                nomeReferencia,
                latitude,
                longitude,
                classificacao,
                localizacao,
                raio
            FROM ponto_referencia
            WHERE idCliente in ('${clientId.toString().replaceAll(',',"','")}')
                AND raio IS NOT NULL
                AND raio NOT LIKE '%k%'
                AND raio NOT LIKE '%m%'
                AND raio NOT LIKE '%K%'
                AND raio NOT LIKE '%M%'
            ORDER BY id DESC
        `)
    }
    
    deleteReference(id: number) {
        return this.connection.query(`
            DELETE FROM ponto_referencia WHERE id=${id}
        `)
    }
    
    updateReference(id: string, name: string, lat: string, lon: string, radius: string) {
        return this.connection.query(`
            UPDATE ponto_referencia
                SET
                    nomeReferencia='${name}',
                    latitude=${lat},
                    longitude=${lon},
                    raio=${radius}
            WHERE id=${id}
        `)
    }

    insertReference(clientId: number, clientName: string, name: string, lat: string, lon: string, classification: string, radius: string) {
        return this.connection.query(`
            INSERT INTO ponto_referencia (idCliente, cliente, nomeReferencia, latitude, longitude, classificacao, localizacao, raio)
            VALUES (${clientId}, '${clientName}', '${name}', '${lat}', '${lon}', '${classification}', '', '${radius}')
        `)
    }
}
