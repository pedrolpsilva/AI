import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TeltonikaService {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.TotalOdometro AS odometro,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.latitude,
                mm.longitude,
                mm.endereco AS localizacao,
                mm.placa,
                mm.bateria_externa AS tensao,
                CAST(CAST(mm.velocidade2 AS FLOAT) AS INT) as velocidade,
                SUBSTRING(mm.PontoReferencia, CHARINDEX(' de ', mm.PontoReferencia) + 4, LEN(mm.PontoReferencia)) AS referenciaNome,
                CASE
                    WHEN mm.temperaturaS1 NOT LIKE '%3000%' THEN mm.temperaturaS1
                    WHEN mm.temperaturaS2 NOT LIKE '%3000%' THEN mm.temperaturaS2
                    WHEN mm.temperaturaS3 NOT LIKE '%3000%' THEN mm.temperaturaS3
                    WHEN mm.temperaturaS4 NOT LIKE '%3000%' THEN mm.temperaturaS4
                END temperatura,
                CASE
                    WHEN LEN(mm.umidadeS1) < 4 THEN mm.umidadeS1
                    WHEN LEN(mm.umidadeS2) < 5 THEN mm.umidadeS2
                    WHEN LEN(mm.umidadeS3) < 4 THEN mm.umidadeS3
                    WHEN LEN(mm.umidadeS4) < 4 THEN mm.umidadeS4
                END umidade,
                mm.idCliente,
                e.descEvento,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta
            FROM movimento_teltonika_frontend mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
				LEFT JOIN evento_teltonika e ON e.idEvento = mm.evento
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
                        mm.idCliente,
                        mm.placa,
                        FORMAT(CAST(mm.dataServidor AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.endereco AS localizacao,
                        mm.velocidade2 AS velocidade,
                        CASE 
                            WHEN mm.ignicao = 1 THEN 'Ligado' 
                            ELSE 'Desligado' 
                        END AS ignicao,
                        CASE 
                            WHEN mm.ignicao = 1 THEN '#00EB00' 
                            ELSE '#FF0322' 
                        END AS statusVeic,
                        CASE
                            WHEN mm.temperaturaS1 NOT LIKE '%3000%' THEN mm.temperaturaS1
                            WHEN mm.temperaturaS2 NOT LIKE '%3000%' THEN mm.temperaturaS2
                            WHEN mm.temperaturaS3 NOT LIKE '%3000%' THEN mm.temperaturaS3
                            WHEN mm.temperaturaS4 NOT LIKE '%3000%' THEN mm.temperaturaS4
                        END temperatura,
                        CASE
                            WHEN LEN(mm.umidadeS1) < 4 THEN mm.umidadeS1
                            WHEN LEN(mm.umidadeS2) < 5 THEN mm.umidadeS2
                            WHEN LEN(mm.umidadeS3) < 4 THEN mm.umidadeS3
                            WHEN LEN(mm.umidadeS4) < 4 THEN mm.umidadeS4
                        END umidade,
                        mm.bateria_externa AS tensao,
                        mm.TotalOdometro AS odometro,
                        cv.idUsuario,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        'teltonika' AS tech,
                        ROW_NUMBER() OVER (PARTITION BY mm.serial ORDER BY mm.dataServidor DESC) AS RowNumber
                    FROM movimento_teltonika_frontend mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                        LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                        LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
                    WHERE asu.id_usuario = ${user}
                        AND mm.latitude != '*'
                        AND mm.longitude != '*'
                        AND mm.latitude IS NOT null
                        AND mm.longitude IS NOT null
                )

                SELECT
                    *
                FROM Veiculos v
                WHERE v.RowNumber = 1
                    AND (
                        EXISTS (
                            SELECT 1 
                            FROM assoc_veiculo av 
                            WHERE av.placa = v.placa
                                AND EXISTS (
                                    SELECT 1 
                                    FROM cliente_cadastro cc 
                                    WHERE cc.id = av.idCliente 
                                        AND cc.ativo = 1
                                )
                        )
                        OR EXISTS (
                            SELECT 1 
                            FROM assoc_veiculos_usuarios asu2 
                            WHERE asu2.id_usuario = ${user}
                        )
                        OR EXISTS (
                            SELECT 1 
                            FROM cliente_cadastro cc2 
                            WHERE cc2.id = v.idCliente 
                                AND cc2.ativo = 1
                        )
                    )
            `)
        } else {
            return this.connection.query(`
                SELECT
					*
                FROM (
                    SELECT DISTINCT
                        mm.serial AS idVeiculo,
                        mm.placa,
                        FORMAT(CAST(mm.dataServidor AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.endereco AS localizacao,
                        mm.idCliente,
                        CAST(CAST(mm.velocidade2 AS FLOAT) AS INT) AS velocidade,
                        IIF(mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        mm.bateria_externa AS tensao,
                        mm.TotalOdometro AS odometro,
                        CASE
                            WHEN mm.temperaturaS1 NOT LIKE '%3000%' THEN mm.temperaturaS1
                            WHEN mm.temperaturaS2 NOT LIKE '%3000%' THEN mm.temperaturaS2
                            WHEN mm.temperaturaS3 NOT LIKE '%3000%' THEN mm.temperaturaS3
                            WHEN mm.temperaturaS4 NOT LIKE '%3000%' THEN mm.temperaturaS4
                        END temperatura,
                        CASE
                            WHEN LEN(mm.umidadeS1) < 4 THEN mm.umidadeS1
                            WHEN LEN(mm.umidadeS2) < 5 THEN mm.umidadeS2
                            WHEN LEN(mm.umidadeS3) < 4 THEN mm.umidadeS3
                            WHEN LEN(mm.umidadeS4) < 4 THEN mm.umidadeS4
                        END umidade,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        m.nome AS motorista,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        'teltonika' AS tech,
                        ROW_NUMBER() OVER (PARTITION BY mm.serial ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_teltonika_frontend mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                        LEFT JOIN motorista m ON m.rfid = mm.RFID
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
                mm.serial AS idVeiculo,
                mm.idCliente,
                mm.placa,
                FORMAT(CAST(mm.dataServidor AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude, 
                mm.longitude,
                mm.endereco AS localizacao,
                mm.velocidade2 AS velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                CASE
                    WHEN mm.temperaturaS1 NOT LIKE '%3000%' THEN mm.temperaturaS1
                    WHEN mm.temperaturaS2 NOT LIKE '%3000%' THEN mm.temperaturaS2
                    WHEN mm.temperaturaS3 NOT LIKE '%3000%' THEN mm.temperaturaS3
                    WHEN mm.temperaturaS4 NOT LIKE '%3000%' THEN mm.temperaturaS4
                END temperatura,
                CASE
                    WHEN LEN(mm.umidadeS1) < 4 THEN mm.umidadeS1
                    WHEN LEN(mm.umidadeS2) < 5 THEN mm.umidadeS2
                    WHEN LEN(mm.umidadeS3) < 4 THEN mm.umidadeS3
                    WHEN LEN(mm.umidadeS4) < 4 THEN mm.umidadeS4
                END umidade,
                mm.bateria_externa AS tensao,
                mm.TotalOdometro AS odometro,
                cv.idUsuario,
                cv.etiqueta,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                m.nome AS motorista
            FROM movimento_teltonika mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN eventos_globais c ON mm.evento = c.id
                LEFT JOIN motorista m ON m.rfid = mm.RFID
                LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
            ORDER BY mm.id DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                mm.serial AS idVeiculo,
                mm.idCliente,
                mm.placa,
                FORMAT(CAST(mm.dataServidor AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude, 
                mm.longitude,
                mm.endereco AS localizacao,
                mm.velocidade2 AS velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                CASE
                    WHEN mm.temperaturaS1 NOT LIKE '%3000%' THEN mm.temperaturaS1
                    WHEN mm.temperaturaS2 NOT LIKE '%3000%' THEN mm.temperaturaS2
                    WHEN mm.temperaturaS3 NOT LIKE '%3000%' THEN mm.temperaturaS3
                    WHEN mm.temperaturaS4 NOT LIKE '%3000%' THEN mm.temperaturaS4
                END temperatura,
                CASE
                    WHEN LEN(mm.umidadeS1) < 4 THEN mm.umidadeS1
                    WHEN LEN(mm.umidadeS2) < 5 THEN mm.umidadeS2
                    WHEN LEN(mm.umidadeS3) < 4 THEN mm.umidadeS3
                    WHEN LEN(mm.umidadeS4) < 4 THEN mm.umidadeS4
                END umidade,
                mm.bateria_externa AS tensao,
                mm.TotalOdometro AS odometro,
                cv.idUsuario,
                cv.etiqueta,
                cv.idCategoria AS categoria,
                m.nome AS motorista
            FROM movimento_teltonika mm
                LEFT JOIN eventos_globais c ON mm.evento = c.id
                LEFT JOIN motorista m ON m.rfid = mm.RFID
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
            WHERE mm.placa = '${place}'
                AND mm.dataServidor BETWEEN '${dateI}' AND '${dateF}'
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
            SELECT
                mm.serial AS idVeiculo,
                mm.idCliente,
                mm.placa,
                FORMAT(CAST(mm.dataServidor AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude, 
                mm.longitude,
                mm.endereco AS localizacao,
                mm.velocidade2 AS velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                CASE
                    WHEN mm.temperaturaS1 NOT LIKE '%3000%' THEN mm.temperaturaS1
                    WHEN mm.temperaturaS2 NOT LIKE '%3000%' THEN mm.temperaturaS2
                    WHEN mm.temperaturaS3 NOT LIKE '%3000%' THEN mm.temperaturaS3
                    WHEN mm.temperaturaS4 NOT LIKE '%3000%' THEN mm.temperaturaS4
                END temperatura,
                CASE
                    WHEN LEN(mm.umidadeS1) < 4 THEN mm.umidadeS1
                    WHEN LEN(mm.umidadeS2) < 5 THEN mm.umidadeS2
                    WHEN LEN(mm.umidadeS3) < 4 THEN mm.umidadeS3
                    WHEN LEN(mm.umidadeS4) < 4 THEN mm.umidadeS4
                END umidade,
                mm.bateria_externa AS tensao,
                mm.TotalOdometro AS odometro,
                cv.idUsuario,
                cv.etiqueta,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                m.nome AS motorista
            FROM movimento_teltonika mm
                LEFT JOIN eventos_globais c ON mm.evento = c.id
                LEFT JOIN motorista m ON m.rfid = mm.RFID
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
                AND mm.dataServidor = '${date}'
        `)
    }
    
    async command(date: string, command: string, commandName: string, place: string, idClient: number, idUser: number, serial: string) {
        await this.connection.query(`
            INSERT INTO
                semaforo_teltonika (data, comando, comandoNome, placa, idClienteLog, idusuarioLog, serial)
                VALUES ('${date}','${command}','${commandName}','${place}', ${idClient}, ${idUser}, ${serial})    
        `)
        .then( async (res) => {
            if (res.rowsAffected > 0) {
                await this.connection.query(`
                    INSERT INTO
                        bkp_semaforo_teltonika (data, comando, comandoNome, placa, idClienteLog, idusuarioLog, serial)
                        VALUES ('${date}','${command}','${commandName}','${place}', ${idClient}, ${idUser}, ${serial})   
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
                FORMAT(CAST(mm.data AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS data,
                mm.data,
                mm.comandoNome,
                mm.placa,
                mm.id,
                b.nome
            FROM bkp_semaforo_teltonika mm
                INNER JOIN new_usuario b ON b.idUsuario = mm.idUsuarioLog
            WHERE mm.placa in (${places})
                AND mm.data BETWEEN '${dateI}' AND '${dateF}'
            ORDER BY data DESC
        `)
    }
}
