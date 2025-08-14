import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class Vl01Service {
    
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.odometro,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                mm.latitude,
                mm.longitude,
                mm.endereco AS localizacao,
                mm.placa,
                mm.tensao_bateria_externa AS tensao,
                CAST (CAST (mm.velocidade AS FLOAT) AS INT) AS velocidade,
                SUBSTRING (mm.PontoReferencia, CHARINDEX(' de ', mm.PontoReferencia) + 4, LEN(mm.PontoReferencia)) AS referenciaNome,
                mm.id_cliente AS idCliente,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta
            FROM movimento_vl01_frontend mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
            WHERE mm.placa='${place}'
            ORDER BY dataGPS DESC
        `)
    }

    position(profile: number, user: number | null, client: string | null) {
        if (profile == 3) {
            return this.connection.query(`
                WITH Veiculos AS (
                    SELECT DISTINCT
                        mm.serial AS idVeiculo,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.endereco AS localizacao,
                        mm.id_cliente AS idCliente,
                        CAST (CAST (mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        mm.tensao_bateria_externa AS tensao,
                        mm.odometro,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_vl01_frontend mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                        LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                        LEFT JOIN cliente_cadastro cc ON cc.id = mm.id_cliente
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
                    v.odometro,
                    v.etiqueta,
                    v.categoria,
                    v.pinPadrao,
                    'vl01' AS tech
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
                    a.odometro,
                    a.etiqueta,
                    a.categoria,
                    a.pinPadrao,
                    'vl01' AS tech
                FROM (
                    SELECT DISTINCT
                        mm.serial AS idVeiculo,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.endereco AS localizacao,
                        mm.id_cliente AS idCliente,
                        CAST (CAST (mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        mm.tensao_bateria_externa AS tensao,
                        mm.odometro,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_vl01_frontend mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                        LEFT JOIN cliente_cadastro cc ON cc.id = mm.id_cliente
                    WHERE mm.id_cliente IN (${client.toString().split(',')})
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
                mm.serial AS idVeiculo,
                mm.id_cliente,
                mm.latitude,
                mm.longitude,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.endereco,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                mm.odometro,
                mm.tensao_bateria_interna AS tensao,
                mm.evento,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                IIF ( mm.evento = 0, 'Normal', b.eventDesc ) AS statusVeic
            FROM movimento_vl01_frontend mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN eventos_globais b ON b.id = mm.evento
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.id_cliente
            WHERE mm.placa = '${place}'
            ORDER BY dataGPS DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT  
                mm.serial,
                mm.id_cliente,
                mm.placa,
                mm.latitude,
                mm.longitude,
                mm.endereco AS localizacao,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.odometro,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                cv.idCategoria AS categoria,
                e.id_evento AS evento
            FROM movimento_vl01 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN evento_vl01 e ON e.id_Evento = mm.evento
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
                mm.serial AS idVeiculo,
                mm.id_cliente,
                mm.placa,
                mm.endereco AS localizacao,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude,
                mm.longitude,
                mm.velocidade,
                mm.tensao_bateria_externa AS tensao,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                mm.odometro,
                cc.pinPadrao,
                cv.idCategoria AS categoria
            FROM movimento_vl01 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.id_cliente
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
                FORMAT(CAST(mc.data AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS data,
                mc.comandoNome,
                mc.placa,
                mc.id,
                b.nome
            FROM bkp_semaforo_vl01 mc
                INNER JOIN new_usuario b ON b.idUsuario = mc.idUsuarioLog
            WHERE mc.placa in (${places})
                AND mc.data BETWEEN '${dateI}' AND '${dateF}'
            ORDER BY mc.data DESC 
        `)
    }
}
