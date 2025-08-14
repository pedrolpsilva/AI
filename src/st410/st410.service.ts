import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class St410Service {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                IIF ( mm.online = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.online = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.placa,
                mm.battery AS tensao,
                CAST(CAST(mm.velocidade AS FLOAT) AS INT) as velocidade,
                mm.temperatura,
                mm.idCliente,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta
            FROM movimento_suntech_frontend_410 mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa='${place}'
            ORDER BY mm.dataGPS DESC
        `)
    }

    position(profile: number, user: number | null, client: string | null) {
        if (profile == 3) {
            return this.connection.query(`
                WITH Veiculos AS (
                    SELECT DISTINCT
                        mm.idVeiculo,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.idCliente,
                        CAST(CAST(mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF(mm.online = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.online = 1, '#00EB00', '#FF0322') AS statusVeic,
                        mm.battery AS tensao,
                        mm.temperatura,
                        cv.etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_suntech_frontend_410 mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                        LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                        LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
                    WHERE asu.id_usuario = ${user}
                        AND mm.latitude != '*'
                        AND mm.longitude != '*'
                        AND mm.latitude IS NOT null
                        AND mm.longitude IS NOT null
                )

                SELECT
                    v.idVeiculo,
                    v.placa,
                    v.dataGPS,
                    v.latitude, 
                    v.longitude,
                    v.localizacao,
                    v.idCliente,
                    v.velocidade,
                    v.ignicao,
                    v.statusVeic,
                    v.tensao,
                    v.temperatura,
                    v.etiqueta,
                    v.categoria,
                    v.pinPadrao,
                    'st410' AS tech
                FROM Veiculos v
                    LEFT JOIN assoc_veiculo av ON av.placa = v.placa
                    LEFT JOIN cliente_cadastro cc ON cc.id = av.idCliente AND cc.ativo = 1
                    LEFT JOIN assoc_veiculos_usuarios asu2 ON asu2.id_veiculo = v.idVeiculo AND asu2.id_usuario = ${user}
                    LEFT JOIN cliente_cadastro cc2 ON cc2.id = v.idCliente AND cc2.ativo = 1
                WHERE v.RowNumber = 1
                    AND (
                        cc.id IS NOT NULL
                        OR asu2.id_usuario IS NOT NULL
                        OR cc2.id IS NOT NULL
                    )
            `)
        } else {
            return this.connection.query(`
                SELECT
                    a.idVeiculo,
                    a.placa,
                    a.dataGPS,
                    a.latitude, 
                    a.longitude,
                    a.localizacao,
                    a.idCliente,
                    a.velocidade,
                    a.ignicao,
                    a.statusVeic,
                    a.tensao,
                    a.temperatura,
                    a.etiqueta,
                    a.categoria,
                    a.pinPadrao,
                    'st410' AS tech
                FROM (
                    SELECT DISTINCT
                        mm.idVeiculo,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.idCliente,
                        CAST(CAST(mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF(mm.online = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.online = 1, '#00EB00', '#FF0322') AS statusVeic,
                        mm.battery AS tensao,
                        mm.temperatura,
                        cv.etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_suntech_frontend_410 mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                        LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
                    WHERE mm.idCliente IN (${client.toString().split(',')})
                        AND mm.latitude != '*'
                        AND mm.longitude != '*'
                        AND mm.latitude IS NOT null
                        AND mm.longitude IS NOT null
                ) AS a
                WHERE a.RowNumber = 1
            `)
        }
    }

    detail(place: string) {
        return this.connection.query(`
            SELECT TOP 1 
                mm.idCliente,
                mm.idModelo,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                CAST(CAST(mm.velocidade AS FLOAT) AS INT) as velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.battery AS tensao,
                mm.temperatura,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                c.eventDesc as tecnologia
            FROM movimento_suntech410 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN c ON c.id = mm.evento
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
            ORDER BY mm.id DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                mm.idVeiculo,
                mm.tecnologia,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude, 
                mm.longitude,
                mm.localizacao,
                mm.idCliente,
                CAST(CAST(mm.velocidade AS FLOAT) AS INT) AS velocidade,
                IIF(mm.online = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF(mm.online = 1, '#00EB00', '#FF0322') AS statusVeic,
                mm.battery AS tensao,
                mm.temperatura,
                cv.idCategoria AS categoria
            FROM movimento_suntech410 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
            WHERE mm.placa = '${place}'
                AND mm.dataGPS BETWEEN '${dateI}' AND '${dateF}'
				AND mm.latitude IS NOT NULL
				AND mm.longitude IS NOT NULL
				AND mm.latitude != ''
				AND mm.longitude != ''
				AND mm.latitude != '*'
				AND mm.longitude != '*'
            ORDER BY mm.dataGPS ASC
        `)
    }

    historyDetail(place: string, date: string) {
        return this.connection.query(`
            SELECT TOP 1
                mm.idCliente,
                mm.idModelo,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                CAST(CAST(mm.velocidade AS FLOAT) AS INT) as velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.battery AS tensao,
                mm.temperatura,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                c.eventDesc as tecnologia
            FROM movimento_suntech410 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
                AND mm.dataGPS = '${date}'
        `)
    }

    getcommand(code: any) {
        return this.connection.query(`
            SELECT 
                id,
                nome 
            FROM comando_suntech 
            WHERE codigo LIKE '%${code}%'    
        `)
    }
    
    async command(date: string, commandName: string, place: string, idClient: number, idUser: number, command: string, serial: string, randomNumber: number) {
        // await this.connection.query(`
        //     INSERT INTO
        //         semaforo_suntech (data, comandoNome, placa,idClienteLog,idUsuarioLog, comando ,serial , numeroComum)
        //         VALUES ('${date}','${commandName}','${place}', ${idClient}, ${idUser}, '${command}', ${serial}, '${randomNumber}')    
        // `)
        // .then( async (res) => {
        //     if (res.rowsAffected > 0) {
        //         await this.connection.query(`
        //             INSERT INTO
        //                 bkp_semaforo_suntech (data, comandoNome, placa,idClienteLog,idUsuarioLog, comando ,serial , numeroComum)
        //                 VALUES ('${date}','${commandName}','${place}', ${idClient}, ${idUser}, '${command}', ${serial}, '${randomNumber}')  
        //         `)
        //         .then((res2) => {
        //             if (res2.rowsAffected > 0) {
        //                 return true
        //             } else {
        //                 return false
        //             }
        //         })
        //         .catch(err => {
        //             return false
        //         })
        //     } else {
        //         return false
        //     }
        // })
        // .catch(err => {
            return false
        // })
    }

    reportCommand(places: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                FORMAT(CAST(mm.data AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS data,
                mm.comandoNome,
                mm.placa,
                mm.id,
                b.nome
            FROM bkp_semaforo_suntech410 mm
                INNER JOIN new_usuario b ON b.idUsuario = mm.idUsuarioLog
            WHERE mm.placa in (${places})
                AND mm.data BETWEEN '${dateI}' AND '${dateF}'
            ORDER BY data DESC    
        `)
    }
}
