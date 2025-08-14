import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class Gv75Service {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT( DATEADD (HOUR, CAST(- 3 AS INTEGER), mm.utctime), 'dd/MM/yyy HH:mm:ss' ) AS dataGPS,
                mm.hodometro AS odometro,
                IIF ( mm.alertaIgnicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.alertaIgnicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.placa,
                mm.tensao,
                mm.velocidade,
                SUBSTRING(mm.PontoReferencia, CHARINDEX(' de ', mm.PontoReferencia) + 4, LEN(mm.PontoReferencia)) AS referenciaNome,
                mm.rpm,
                mm.idCliente,
                e.eventDesc AS evento,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta
            FROM movimento_grcad_frontend mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais e ON e.id = mm.evento
            WHERE mm.placa='${place}'
            ORDER BY msasDataServidor DESC
        `)
    }

    position(profile: number, user: number | null, client: string | null) {
        if (profile == 3) {
            return this.connection.query(`
               WITH Veiculos AS (
                    SELECT DISTINCT
						mm.uniqueid AS idVeiculo,
                        mm.placa,
                        FORMAT( DATEADD (HOUR, CAST(- 3 AS INTEGER), mm.utctime), 'dd/MM/yyy HH:mm:ss' ) AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.idCliente,
                        CAST(CAST(mm.speed AS FLOAT) AS INT) AS velocidade,
                        IIF(mm.ignicao = 0, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.ignicao = 0, '#00EB00', '#FF0322') AS statusVeic,
                        mm.externalpower AS tensao,
                        mm.mileage AS odometro,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        m.nome AS motorista,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.msasDataServidor DESC) AS RowNumber
                    FROM movimento_gv75_frontend mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.uniqueid
                        LEFT JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                        LEFT JOIN motorista m ON m.rfid = mm.gsRfid
                        LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
                    WHERE asu.id_usuario = ${user}
                        AND mm.latitude != '*'
                        AND mm.longitude != '*'
                        AND mm.latitude IS NOT null
                        AND mm.longitude IS NOT null
                )

                SELECT
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
                    v.motorista,
                    v.categoria,
                    v.pinPadrao,
                    'gv75' AS tech
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
                    CAST(CAST(a.velocidade AS FLOAT) AS INT) AS velocidade,
                    a.ignicao,
                    a.statusVeic,
                    a.tensao,
                    a.odometro,
                    a.etiqueta,
                    a.motorista,
                    a.categoria,
                    a.pinPadrao,
                    'gv75' AS tech
                FROM (
                    SELECT DISTINCT
                        mm.uniqueid AS idVeiculo,
                        mm.placa,
                        FORMAT( DATEADD (HOUR, CAST(- 3 AS INTEGER), mm.utctime), 'dd/MM/yyy HH:mm:ss' ) AS dataGPS,
                        mm.latitude, 
                        mm.longitude,
                        mm.localizacao,
                        mm.idCliente,
                        CAST(CAST(mm.speed AS FLOAT) AS INT) AS velocidade,
                        IIF(mm.ignicao = 0, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.ignicao = 0, '#00EB00', '#FF0322') AS statusVeic,
                        mm.externalpower AS tensao,
                        mm.mileage AS odometro,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        m.nome AS motorista,
                        cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.msasDataServidor DESC) AS RowNumber
                    FROM movimento_gv75_frontend mm
                        JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                        LEFT JOIN motorista m ON m.rfid = mm.gsRfid
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
                a.idCliente,
                a.latitude,
                a.longitude,
                a.placa,
                FORMAT(DATEADD (HOUR, CAST(- 3 AS INTEGER), a.utctime), 'yyyy-MM-dd HH:mm:ss' ) AS dataGPS,
                a.localizacao,
                a.speed AS velocidade,
                IIF ( a.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( a.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                a.mileage as odometro,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                m.nome AS motorista
            FROM movimento_gv75_frontend a
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais b ON b.id = a.event
                LEFT JOIN motorista m ON m.rfid = a.gsRfid
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE a.placa = '${place}'
            ORDER BY msasDataServidor DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                countnumber,
                cv.etiqueta,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.placa,
                mm.speed AS velocidade,
                CONCAT(COALESCE(g.alertDesc, '-----'), ' / ', COALESCE(h.alertDesc, '-----')) AS evento,
                mm.longitude,
                mm.latitude,
                mm.localizacao,
                mm.uniqueid AS idVeiculo,
                FORMAT( DATEADD (HOUR, CAST(- 3 AS INTEGER), mm.utctime), 'dd/MM/yyy HH:mm:ss' ) AS dataGPS,
                ROUND(CAST(mm.externalpower AS FLOAT) / 1000, 2) AS tensao,
                cv.idCategoria AS categoria,
                mm.mileage AS odometro
            FROM movimento_gv75 mm
                LEFT JOIN alerts_gv75 g ON mm.event = g.alertValue
                    AND g.alertType NOT LIKE 'REPORTIDTYPE'
                    AND mm.header = g.alertHeader
                LEFT JOIN alerts_gv75 h ON mm.eventTypeId = h.alertValue
                    AND mm.header = h.alertHeader
                    AND h.alertType LIKE 'REPORTIDTYPE'
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
            WHERE mm.placa = '${place}'
                AND mm.utctime BETWEEN '${dateI}' AND '${dateF}'
				AND mm.latitude IS NOT NULL
				AND mm.longitude IS NOT NULL
				AND mm.latitude != ''
				AND mm.longitude != ''
				AND mm.latitude != '*'
				AND mm.longitude != '*'
            ORDER BY mm.msasDataServidor ASC
        `)
    }

    historyDetail(place: string, date: string) {
        return this.connection.query(`
            SELECT TOP 1 
                IIF (mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                mm.placa,
                FORMAT( DATEADD (HOUR, CAST(- 3 AS INTEGER), mm.utctime), 'dd/MM/yyy HH:mm:ss' ) AS dataGPS,
                mm.localizacao,
                mm.speed AS velocidade,
                mm.externalpower AS tensao,
                mm.mileage as odometro,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
				e.eventDesc
            FROM movimento_gv75 mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais e ON e.id = mm.event
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
                AND mm.utctime = '${date}'
            ORDER BY mm.countnumber DESC
        `)
    }
    
    async command(date: string, commandName: string, place: string, idClient: number, idUser: number, command: string, randomNumber: number) {
        const serial = await this.connection.query(`
            SELECT serial FROM cadastro_veiculo WHERE placa='${place}'
        `)
        await this.connection.query(`
            INSERT INTO 
            semaforo_gv75 (data, placa, idRastreador, comando, idUsuarioLog, idClienteLog, comando_nome, numeroComum)
            VALUES ('${date}', '${place}','${serial}', '${command}', ${idUser}, ${idClient}, '${commandName}', ${randomNumber})    
        `)
        .then( async (res) => {
            if (res.rowsAffected > 0) {
                await this.connection.query(`
                    INSERT INTO 
                        bkp_semaforo_gv75 (data, placa, idRastreador, comando, idUsuarioLog, idClienteLog, comando_nome, numeroComum)
                        VALUES ('${date}', '${place}','${serial}', '${command}', ${idUser}, ${idClient}, '${commandName}', ${randomNumber})  
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
                mm.comando_nome AS comandoNome,
                mm.placa,
                mm.id,
                b.nome
            FROM bkp_semaforo_gv75 mm
                INNER JOIN new_usuario b ON b.idUsuario = mm.idUsuarioLog
            WHERE mm.placa in (${places})
                AND mm.data BETWEEN '${dateI}'
                AND '${dateF}'
            ORDER BY data DESC
        `)
    }
}
