import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class St390Service {
    
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                CASE 
                    WHEN (mm.tipo = 'STT') THEN (select eventDesc from eventos_suntech_stt a where evento = a.codEvento )
                    WHEN (mm.tipo = 'ALT') THEN (select eventDesc from eventos_suntech_alt a where evento = a.codEvento )
                    WHEN (mm.tipo = 'EMG') THEN (select eventoDesc from eventos_suntech_emg a where evento = a.codEvento )
                    WHEN (mm.tipo = 'EVT') THEN (select eventDesc from eventos_suntech_evt a where evento = a.codEvento )
                ELSE '' END evento,
                e.descricao AS evento,
                mm.odometro,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.placa,
                mm.tensao,
                mm.velocidade,
                mm.PontoReferencia,
                mm.idCliente,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta,
                e.eventDesc
            FROM movimento_suntech_st390_frontend mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_suntech_st390 e ON e.codEvento = mm.evento
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
                        mm.tecnologia,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.idCliente,
                        CAST(CAST(mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF(mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        mm.tensao,
                        mm.odometro,
                        mm.horimetro,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_suntech_st390_frontend mm
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
                    v.tecnologia,
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
                    v.horimetro,
                    v.etiqueta,
                    v.categoria,
                    v.pinPadrao,
                    'st390' AS tech
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
                    a.tecnologia,
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
                    a.horimetro,
                    a.etiqueta,
                    a.categoria,
                    a.pinPadrao,
                    'st390' AS tech
                FROM (
                    SELECT DISTINCT
                        mm.idVeiculo,
                        mm.tecnologia,
                        mm.placa,
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.idCliente,
                        CAST(CAST(mm.velocidade AS FLOAT) AS INT) AS velocidade,
                        IIF(mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        mm.tensao,
                        mm.odometro,
                        mm.horimetro,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        'st390' AS tech,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_suntech_st390_frontend mm
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
                mm.idModelo,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.dataServidor,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.tensao,
                mm.odometro,
                mm.eventDesc as tecnologia,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                e.eventDesc
            FROM movimento_suntech_st390 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN eventos_suntech_st390 e ON e.codEvento = mm.evento
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE idVeiculo = '${place}'
            ORDER BY mm.id DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                mm.idVeiculo,
                mm.idCliente,
                mm.idModelo,
                mm.tecnologia,
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.dataServidor,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF (mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.tensao,
                mm.odometro,
                cv.idCategoria AS categoria,
                e.eventDesc AS evento
            FROM movimento_suntech_st390 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN eventos_suntech_st390 e ON e.codEvento = mm.evento
            WHERE placa = '${place}'
                AND dataGPS BETWEEN '${dateI}' AND '${dateF}'
				AND mm.latitude IS NOT NULL
				AND mm.longitude IS NOT NULL
				AND mm.latitude != ''
				AND mm.longitude != ''
				AND mm.latitude != '*'
				AND mm.longitude != '*'
            ORDER BY dataGPS ASC
        `)
    }

    historyDetail(place: string, date: string) {
        return this.connection.query(`
            SSELECT TOP 1
                mm.placa,
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.localizacao,
                mm.velocidade,
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                mm.tensao,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                mm.odometro
            FROM movimento_suntech_st390 mm
                JOIN cadastro_veiculo cv ON cv.serial = mm.idVeiculo
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.idVeiculo = '${place}'
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
            FROM bkp_semaforo_suntech_st390 mc
                LEFT JOIN new_usuario b ON b.idUsuario = mc.idUsuarioLog
            WHERE mc.placa in ('${places}')
                AND mc.data BETWEEN '${dateI}' AND '${dateF}'
            ORDER BY data DESC
        `)
    }
}
