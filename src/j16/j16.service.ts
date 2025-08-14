import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class J16Service {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                mm.latitude,
                mm.longitude,
                mm.endereco AS localizacao,
                mm.placa,
                CAST (IIF (mm.tensao_bateria_externa IS NOT NULL, TRY_CONVERT (FLOAT, mm.tensao_bateria_externa), 0) AS VARCHAR(10)) AS tensao,
                CAST (CAST (mm.velocidade AS FLOAT) AS INT) AS velocidade,
                SUBSTRING (mm.PontoReferencia, CHARINDEX(' de ', mm.PontoReferencia) + 4, LEN(mm.PontoReferencia)) AS referenciaNome,
                mm.id_cliente AS idCliente,
                '0' AS odometro,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta                
            FROM movimento_J16_frontend mm
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
						mm.id,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        CAST (mm.latitude AS FLOAT) * 1 AS latitude,
                        CAST (mm.longitude AS FLOAT) * 1 AS longitude,
                        mm.endereco AS localizacao,
                        mm.id_cliente AS idCliente,
                        CAST (CAST (mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        CAST (IIF (mm.tensao_bateria_externa IS NOT NULL, TRY_CONVERT (FLOAT, mm.tensao_bateria_externa), 0) AS VARCHAR(10)) AS tensao,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_j16_frontend mm
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
                    v.etiqueta,
                    v.categoria,
                    '0' AS odometro,
                    v.pinPadrao,
                    'j16' AS tech
                FROM Veiculos v
                    LEFT JOIN assoc_veiculo av ON av.placa = v.placa
                    LEFT JOIN cliente_cadastro cc ON cc.id = av.idCliente AND cc.ativo = 1
                    LEFT JOIN assoc_veiculos_usuarios asu2 ON asu2.id_veiculo = v.id AND asu2.id_usuario = ${user}
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
                    a.etiqueta,
                    a.categoria,
                    '0' AS odometro,
                    a.pinPadrao,
                    'j16' AS tech
                FROM (
                    SELECT DISTINCT
                        mm.serial AS idVeiculo,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        CAST (mm.latitude AS FLOAT) * 1 AS latitude,
                        CAST (mm.longitude AS FLOAT) * 1 AS longitude,
                        mm.endereco AS localizacao,
                        mm.id_cliente AS idCliente,
                        CAST (CAST (mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        CAST (IIF (mm.tensao_bateria_externa IS NOT NULL, TRY_CONVERT (FLOAT, mm.tensao_bateria_externa), 0) AS VARCHAR(10)) AS tensao,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_j16_frontend mm
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
                CAST (mm.latitude AS FLOAT) * 1 AS latitude,
                CAST (mm.longitude AS FLOAT) * 1 AS longitude,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.endereco AS localizacao,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                cv.idCategoria AS categoria,
                '0' AS odometro,
                cc.pinPadrao,
                CAST (IIF (mm.tensao_bateria_externa IS NOT NULL, TRY_CONVERT (FLOAT, mm.tensao_bateria_externa), 0) AS VARCHAR(10)) AS tensao
            FROM movimento_j16_frontend mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.id_cliente
            WHERE mm.placa = '${place}'
            ORDER BY mm.dataGPS DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.endereco AS localizacao,
                mm.velocidade,
                CAST (mm.latitude AS FLOAT) * 1 AS latitude,
                CAST (mm.longitude AS FLOAT) * 1 AS longitude,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                cv.idCategoria AS categoria,
                '0' AS odometro,
                CAST (IIF (mm.tensao_bateria_externa IS NOT NULL, TRY_CONVERT (FLOAT, mm.tensao_bateria_externa), 0) AS VARCHAR(10)) AS tensao
            FROM movimento_j16 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
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
                CAST (mm.latitude AS FLOAT) * 1 AS latitude,
                CAST (mm.longitude AS FLOAT) * 1 AS longitude,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.endereco AS localizacao,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                cv.idCategoria AS categoria,
                '0' AS odometro,
                cc.pinPadrao,
                CAST (IIF (mm.tensao_bateria_externa IS NOT NULL, TRY_CONVERT (FLOAT, mm.tensao_bateria_externa), 0) AS VARCHAR(10)) AS tensao
            FROM movimento_j16 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.id_cliente
            WHERE placa = '${place}'
                AND dataGPS = '${date}'
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
        await this.connection.query(`
            INSERT INTO
                semaforo_j16 (data, comandoNome, placa,idClienteLog,idUsuarioLog, comando ,serial , numeroComum)
                VALUES ('${date}','${commandName}','${place}', ${idClient}, ${idUser}, '${command}', ${serial}, '${randomNumber}')    
        `)
        .then( async (res) => {
            if (res.rowsAffected > 0) {
                await this.connection.query(`
                    INSERT INTO
                        bkp_semaforo_j16 (data, comandoNome, placa,idClienteLog,idUsuarioLog, comando ,serial , numeroComum)
                        VALUES ('${date}','${commandName}','${place}', ${idClient}, ${idUser}, '${command}', ${serial}, '${randomNumber}')  
                `)
                .then((res2) => {
                    if (res2.rowsAffected > 0) {
                        return true
                    } else {
                        return false
                    }
                })
                .catch(err => {
                    return false
                })
            } else {
                return false
            }
        })
        .catch(err => {
            return false
        })
    }

    reportCommand(places: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                FORMAT(CAST(mc.data AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS data,
                mc.comandoNome,
                mc.placa,
                mc.id,
                b.nome
            FROM bkp_semaforo_j16 mc
                INNER JOIN new_usuario b ON b.idUsuario = mc.idUsuarioLog
            WHERE mc.placa in (${places})
                AND mc.data BETWEEN '${dateI}' AND '${dateF}'
            ORDER BY mc.data DESC 
        `)
    }
}
