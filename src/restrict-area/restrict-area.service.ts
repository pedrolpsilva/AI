import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class RestrictAreaService {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    restrictArea(client: string) {
        return this.connection.query(`
            SELECT
                id,
                nome,
                descricao,
                color,
                placa,
                area_json
            FROM area_restrita
            WHERE id_cliente in ('${client.toString().replaceAll(',',"','")}')
        `)
    }
}
