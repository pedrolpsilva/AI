import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class GrcadService {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.hodometro AS odometro,
                IIF ( mm.alertaIgnicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.alertaIgnicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.placa,
                mm.tensao,
                mm.velocidade,
                mm.PontoReferencia,
                mm.rpm,
                mm.idCliente,
                e.descricao AS evento,
                cv.idCategoria AS categoria,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta
            FROM movimento_grcad_frontend mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN evento_grcad e ON e.id = mm.evento
            WHERE mm.placa='${place}'
            ORDER BY dataGPS DESC
        `)
    }

    position(profile: number, user: number | null, client: string | null) {
        if (profile == 3) {
            return this.connection.query(`
               SELECT DISTINCT
                    mm.serial as idVeiculo, 
                    mm.tensao, 
                    mm.placa, 
                    cast(mm.velocidade as numeric(10, 0)) as velocidade,
                    mm.longitude, 
                    mm.latitude, 
                    mm.localizacao, 
                    FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                    mm.hodometro AS odometro, 
                    mm.idCliente,
                    mm.horimetro,
                    IIF ( mm.alertaIgnicao = 1, 'Ligado', 'Desligado') as ignicao,
                    IIF ( mm.alertaIgnicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                    m.nome AS motorista,
                    ISNULL(cv.etiqueta, '') AS etiqueta,
                    g.descricao as evento, 
                    cv.idCategoria as categoria,
                    asu.id_usuario,
                    cv.idCategoria AS categoria,
                    cc.pinPadrao,
                    'grcad' AS tech
                FROM movimento_grcad_frontend mm
                    JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                    LEFT JOIN evento_grcad g ON mm.evento = g.id 
                    LEFT JOIN cliente_cadastro cli ON cli.id = mm.idCliente
                    LEFT JOIN assoc_veiculos_usuarios asu on asu.id_veiculo = cv.id
                    LEFT JOIN motorista m ON m.rfid = mm.gsRfid
                    LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
                WHERE asu.id_usuario = ${user}
                    AND mm.placa is not null 
                    AND dataServidor = (
                        SELECT MAX(dataServidor) FROM movimento_grcad_frontend i
                        WHERE mm.serial = i.serial 
                        AND mm.idCliente = i.idCliente
                        AND evento is not null
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
                    'grcad' AS tech
                FROM (
                    SELECT DISTINCT
						mm.serial AS idVeiculo, 
						mm.tensao, 
						mm.placa, 
						CAST (mm.velocidade AS numeric(10, 0)) AS velocidade,
						mm.longitude, 
						mm.latitude, 
						mm.localizacao, 
                        FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
						mm.hodometro AS odometro, 
						mm.idCliente,
						mm.horimetro,
						IIF ( mm.alertaIgnicao = 1, 'Ligado', 'Desligado') AS ignicao,
						IIF ( mm.alertaIgnicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
						g.descricao AS evento, 
						m.nome AS motorista,
						cv.idCategoria AS categoria,
                        cc.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_grcad_frontend mm
                        JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                        LEFT JOIN motorista m ON m.rfid = mm.gsRfid
                        LEFT JOIN evento_grcad g ON mm.evento = g.id 
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
                IIF ( mm.alertaIgnicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.alertaIgnicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                mm.tensao, 
                mm.placa, 
                CAST (mm.velocidade as numeric(10, 0)) AS velocidade,
                mm.longitude, 
                mm.latitude, 
                mm.localizacao, 
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.hodometro AS odometro, 
                mm.idCliente,
                e.descricao AS tecnologia,
                m.nome AS motorista,
                g.descricao AS evento, 
                cc.pinPadrao,
                cv.idCategoria AS categoria
            FROM movimento_grcad_frontend mm, evento_grcad e
                JOIN cadastro_veiculo cv ON cv.serial = mm.serial
                LEFT JOIN motorista m ON m.rfid = mm.gsRfid
                LEFT JOIN evento_grcad g ON mm.evento = g.id 
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
                AND mm.evento = e.id
            ORDER BY dataGPS DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                mm.serial AS idVeiculo, 
                IIF ( mm.alertaIgnicao = 1, 'Ligado', 'Desligado') AS ignicao,
                IIF ( mm.alertaIgnicao = 1, '#00EB00', '#FF0322' ) AS statusVeic,
                mm.tensao, 
                mm.placa, 
                CAST (mm.velocidade AS numeric(10, 0)) AS velocidade,
                mm.longitude, 
                mm.latitude, 
                mm.localizacao, 
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.hodometro AS odometro, 
                mm.idCliente,
                cv.etiqueta,
                cv.idCategoria AS categoria,
                g.descricao AS evento, 
                m.nome AS motorista
            FROM movimento_grcad mm 
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa 
                LEFT JOIN evento_grcad g ON g.id = mm.evento 
                LEFT JOIN motorista m ON m.rfid = mm.gsRfid
            WHERE mm.placa is not null 
                AND mm.placa = '${place}'
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
                IIF (alertaIgnicao = 1, 'Ligado', 'Desligado') AS ignicao,
                mm.tensao, 
                mm.placa, 
                CAST (mm.velocidade AS numeric(10, 0)) AS velocidade,
                mm.localizacao, 
                FORMAT(CAST(mm.dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                mm.hodometro AS odometro,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                m.nome AS motorista
            FROM movimento_grcad mm
                JOIN evento_grcad g ON g.id = mm.evento
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa 
                LEFT JOIN motorista m ON m.rfid = mm.gsRfid
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa = '${place}'
                AND mm.dataGPS = '${date}'
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
