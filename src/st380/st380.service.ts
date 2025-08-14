import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class St380Service {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                IIF (mm.tipo = 'STT', (select eventDesc from eventos_suntech_stt a where mm.event_id = a.codEvento),
                    IIF (mm.tipo = 'ALT',  (select eventDesc from eventos_suntech_alt a where mm.event_id = a.codEvento),
                        IIF (mm.tipo = 'EMG', (select eventoDesc from eventos_suntech_emg a where mm.event_id = a.codEvento),
                            IIF (mm.tipo = 'EVT', (select eventDesc from eventos_suntech_evt a where mm.event_id = a.codEvento) , '')
                        )
                    )
                ) AS evento,
                mm.distance AS odometro,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.placa,
                mm.battery AS tensao,
                CAST(CAST(mm.velocidade AS FLOAT) AS INT) as velocidade,
                SUBSTRING(mm.PontoReferencia, CHARINDEX(' de ', mm.PontoReferencia) + 4, LEN(mm.PontoReferencia)) AS referenciaNome,
                mm.idCliente,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta
            FROM movimento_suntech380_frontend mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais c ON mm.event_id = c.id
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
                        mm.idCliente,
                        mm.placa,
                        FORMAT(CAST(mm.dataServidor AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.velocidade,
                        CASE 
                            WHEN mm.ignicao = 1 THEN 'Ligado' 
                            ELSE 'Desligado' 
                        END AS ignicao,
                        CASE 
                            WHEN mm.ignicao = 1 THEN '#00EB00' 
                            ELSE '#FF0322' 
                        END AS statusVeic,
                        mm.battery AS tensao,
                        mm.distance AS odometro,
                        cv.idUsuario,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        'st380' AS tech,
                        ROW_NUMBER() OVER (PARTITION BY mm.idVeiculo ORDER BY mm.dataServidor DESC) AS RowNumber
                    FROM movimento_suntech380_frontend mm
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
                        mm.idVeiculo,
                        mm.idCliente,
                        mm.placa,
                        FORMAT(CAST(mm.dataServidor AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.velocidade,
                        CASE 
                            WHEN mm.ignicao = 1 THEN 'Ligado' 
                            ELSE 'Desligado' 
                        END AS ignicao,
                        CASE 
                            WHEN mm.ignicao = 1 THEN '#00EB00' 
                            ELSE '#FF0322' 
                        END AS statusVeic,
                        mm.battery AS tensao,
                        mm.distance AS odometro,
                        cv.idUsuario,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        'st380' AS tech,
                        ROW_NUMBER() OVER (PARTITION BY mm.idVeiculo ORDER BY mm.dataServidor DESC) AS RowNumber
                    FROM movimento_suntech380_frontend mm
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
                mm.idVeiculo,
                mm.idCliente,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude, 
                mm.longitude,
                mm.localizacao,
                mm.velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                mm.battery AS tensao,
                mm.distance AS odometro,
                cv.idUsuario,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                cv.etiqueta
            FROM movimento_suntech380 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN eventos_globais c ON mm.event_id = c.id
                LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
            ORDER BY mm.id DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                mm.idVeiculo,
                mm.idCliente,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude, 
                mm.longitude,
                mm.localizacao,
                mm.velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                mm.battery AS tensao,
                mm.distance AS odometro,
                cv.idUsuario,
                cv.idCategoria AS categoria,
                cv.etiqueta
            FROM movimento_suntech380 mm
                LEFT JOIN eventos_globais c ON mm.event_id = c.id
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
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
            SELECT
                mm.idVeiculo,
                mm.idCliente,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.latitude, 
                mm.longitude,
                mm.localizacao,
                mm.velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF (mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                mm.battery AS tensao,
                mm.distance AS odometro,
                cv.idUsuario,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                cv.etiqueta
            FROM movimento_suntech380 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN eventos_globais c ON mm.event_id = c.id
                LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
                AND mm.dataGPS = '${date}'
        `)
    }
    
    async command(date: string, command: string, commandName: string, place: string, idClient: number, idUser: number, serial: string) {
        await this.connection.query(`
            INSERT INTO
                semaforo_suntech380 (data, comando, comandoNome, placa, idClienteLog, idusuarioLog, serial)
                VALUES ('${date}','${command}','${commandName}','${place}', ${idClient}, ${idUser}, ${serial})    
        `)
        .then( async (res) => {
            if (res.rowsAffected > 0) {
                await this.connection.query(`
                    INSERT INTO
                        bkp_semaforo_suntech380 (data, comando, comandoNome, placa, idClienteLog, idusuarioLog, serial)
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
                mm.comandoNome,
                mm.placa,
                mm.id,
                b.nome
            FROM bkp_semaforo_suntech380 mm
                INNER JOIN new_usuario b ON b.idUsuario = mm.idUsuarioLog
            WHERE mm.placa in (${places})
                AND mm.data BETWEEN '${dateI}' AND '${dateF}'
            ORDER BY data DESC
        `)
    }
}
