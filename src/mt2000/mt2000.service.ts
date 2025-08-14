import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class Mt2000Service {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}

    monitoring(place: string) {
        return this.connection.query(`
            SELECT TOP 1
                FORMAT(DATEADD (HOUR, CAST(- 0 AS INTEGER), mm.dataGPS), 'dd/MM/yyyy HH:mm:ss' ) AS dataGPS,
                mm.ODEMETER_TOTAL AS odometro,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.latitude,
                mm.longitude,
                mm.localizacao,
                mm.placa,
                mm.tensao,
                mm.velocidade,
                SUBSTRING(mm.PontoReferencia, CHARINDEX(' de ', mm.PontoReferencia) + 4, LEN(mm.PontoReferencia)) AS referenciaNome,
                mm.idCliente,
                IIF ( cv.etiqueta != mm.placa, cv.etiqueta, null) AS etiqueta,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                e.eventDesc AS evento
            FROM movimento_mt2000_frontend mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais e ON e.id = mm.evento
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE mm.placa='${place}'
            ORDER BY dataGPS DESC
        `)
    }

    position(profile: number, user: number | null, client: string | null) {
        if (profile == 3) {
            return this.connection.query(`
                 WITH Veiculo AS (
                    SELECT 
                        mm.serial AS idVeiculo,
                        mm.idCliente,
                        mm.localizacao,
                        mm.placa,
                        FORMAT(DATEADD (HOUR, CAST(- 0 AS INTEGER), mm.dataGPS), 'dd/MM/yyyy HH:mm:ss' ) AS dataGPS,
                        mm.latitude,
                        mm.longitude,
                        mm.velocidade,
                        mm.tensao,
                        IIF(mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        cv.idUsuario,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        cv.idCategoria AS categoria,
                        c.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_mt2000_frontend mm
                        JOIN alerts_Mt2000 amt ON mm.MSG_TYPE = amt.header_message
                        JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                        JOIN cliente_cadastro c ON c.id = mm.idCliente
                        LEFT JOIN ponto_referencia pr ON pr.id = mm.idPontoReferencia
                        LEFT JOIN area_restrita ar ON ar.id = mm.idarearestrita
                        JOIN assoc_veiculos_usuarios asu ON asu.id_veiculo = cv.id
                    WHERE asu.id_usuario = ${user}
                        AND mm.LATITUDE IS NOT NULL
                        AND mm.LONGITUDE IS NOT NULL
                        AND mm.LATITUDE != ''
                        AND mm.LONGITUDE != ''
                        AND mm.latitude != '*'
                        AND mm.longitude != '*'
                ),
                VeiculosValidos AS (
                    SELECT
                        v.idVeiculo,
                        v.idCliente,
                        v.localizacao,
                        v.placa,
                        v.dataGPS,
                        v.latitude,
                        v.longitude,
                        v.velocidade,
                        v.tensao,
                        v.ignicao,
                        v.statusVeic,
                        v.idUsuario,
                        v.etiqueta,
                        v.categoria,
                        v.pinPadrao,
                        'mt2000' AS tech
                    FROM Veiculo v
                        JOIN assoc_veiculo av ON av.placa = v.placa
                        JOIN cliente_cadastro cc ON cc.id = av.idCliente
                    WHERE cc.ativo = 1

                    UNION

                    SELECT
                        v.idVeiculo,
                        v.idCliente,
                        v.localizacao,
                        v.placa,
                        v.dataGPS,
                        v.latitude,
                        v.longitude,
                        v.velocidade,
                        v.tensao,
                        v.ignicao,
                        v.statusVeic,
                        v.idUsuario,
                        v.etiqueta,
                        v.categoria,
                        v.pinPadrao,
                        'mt2000' AS tech
                    FROM
                        Veiculo v
                    WHERE EXISTS (
                        SELECT TOP 1 *
                        FROM assoc_veiculos_usuarios asu
                        WHERE asu.id_usuario = ${user}
                    )
                        AND EXISTS (
                            SELECT TOP 1 *
                            FROM cliente_cadastro cc
                            WHERE cc.id = v.idCliente
                                AND cc.ativo = 1
                        )
						AND v.RowNumber = 1
                )

                SELECT
                    *
                FROM VeiculosValidos
                ORDER BY dataGPS DESC
            `)
        } else {
            return this.connection.query(`
                WITH ClientesAtivos AS (
                    SELECT id
                    FROM cliente_cadastro
                    WHERE id IN (${client}) AND ativo = 1
                ),
                Veiculo AS (
                    SELECT 
                        mm.serial AS idVeiculo,
                        mm.idCliente,
                        mm.localizacao,
                        mm.placa,
                        FORMAT(DATEADD (HOUR, CAST(- 0 AS INTEGER), mm.dataGPS), 'dd/MM/yyyy HH:mm:ss' ) AS dataGPS,
                        mm.latitude,
                        mm.longitude,
                        mm.velocidade,
                        mm.tensao,
                        IIF(mm.ignicao = 1, 'Ligado', 'Desligado') AS ignicao,
                        IIF(mm.ignicao = 1, '#00EB00', '#FF0322') AS statusVeic,
                        cv.idcategoria,
                        cv.idUsuario,
                        cv.idCategoria AS categoria,
                        ISNULL(cv.etiqueta, '') AS etiqueta,
                        (
                            SELECT MAX(dataGPS)
                            FROM movimento_mt2000_frontend i
                            WHERE i.serial = mm.serial
                            AND i.latitude IS NOT NULL
                            AND i.longitude IS NOT NULL
                            AND i.latitude != ''
                            AND i.longitude != ''
                        ) AS ultimaDataGPS,
                        c.pinPadrao,
                        ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
                    FROM movimento_mt2000_frontend mm
                        JOIN alerts_Mt2000 amt ON mm.MSG_TYPE = amt.header_message
                        JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                        JOIN cliente_cadastro c ON c.id = mm.idCliente
                        LEFT JOIN ponto_referencia pr ON pr.id = mm.idPontoReferencia
                        LEFT JOIN area_restrita ar ON ar.id = mm.idarearestrita
                    WHERE 
                        mm.latitude IS NOT NULL
                        AND mm.longitude IS NOT NULL
                        AND mm.latitude != ''
                        AND mm.longitude != ''
                        AND mm.latitude != '*'
                        AND mm.longitude != '*'
                )

                SELECT DISTINCT
                    v.idVeiculo,
                    v.idCliente,
                    v.localizacao,
                    v.placa,
                    v.dataGPS,
                    v.latitude,
                    v.longitude,
                    v.velocidade,
                    v.tensao,
                    v.ignicao,
                    v.statusVeic,
                    v.idcategoria,
                    v.idUsuario,
                    v.etiqueta,
                    v.categoria,
                    v.pinPadrao,
                    'mt2000' AS tech
                FROM Veiculo v
                    JOIN ClientesAtivos ca ON ca.id = v.idCliente
                WHERE v.RowNumber = 1
            `)
        }
    }

    detail(place: string) {
        return this.connection.query(`
            SELECT
                mm.serial as idVeiculo,
                mm.idCliente,
                mm.latitude,
                mm.longitude,
                mm.placa,
                FORMAT(DATEADD (HOUR, CAST(- 0 AS INTEGER), mm.dataGPS), 'dd/MM/yyyy HH:mm:ss' ) AS dataGPS,
                mm.dataServidor,
                mm.localizacao,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.tensao,
                mm.ODEMETER_TOTAL as odometro,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                e.eventDesc as tecnologia
            FROM movimento_mt2000_frontend as mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais e ON e.id = mm.evento
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE datalength(mm.longitude) > 0
                AND datalength(mm.latitude) > 0
                AND mm.placa = '${place}'
            ORDER BY datagps DESC
        `)
    }

    history(place: string, dateI: string, dateF: string) {
        return this.connection.query(`
            SELECT
                mm.serial as idVeiculo,
                mm.idCliente,
                mm.latitude,
                mm.longitude,
                mm.placa,
                FORMAT(DATEADD (HOUR, CAST(- 0 AS INTEGER), mm.dataGPS), 'dd/MM/yyyy HH:mm:ss' ) AS dataGPS,
                mm.dataServidor,
                mm.localizacao,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.tensao,
                mm.ODEMETER_TOTAL as odometro,
                cv.idCategoria AS categoria,
                e.eventDesc as tecnologia
            FROM movimento_mt2000 as mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais e ON e.id = mm.evento
            WHERE datalength(mm.longitude) > 0
                AND datalength(mm.latitude) > 0
                AND mm.placa = '${place}'
                AND mm.dataGPS BETWEEN '${dateI}' AND '${dateF}'
				AND mm.latitude IS NOT NULL
				AND mm.longitude IS NOT NULL
				AND mm.latitude != ''
				AND mm.longitude != ''
				AND mm.latitude != '*'
				AND mm.longitude != '*'
            ORDER BY datagps DESC
        `)
    }

    historyDetail(place: string, date: string) {
        return this.connection.query(`
            SELECT
                mm.serial as idVeiculo,
                mm.idCliente,
                mm.latitude,
                mm.longitude,
                mm.placa,
                FORMAT(DATEADD (HOUR, CAST(- 0 AS INTEGER), mm.dataGPS), 'dd/MM/yyyy HH:mm:ss' ) AS dataGPS,
                mm.dataServidor,
                mm.localizacao,
                mm.velocidade,
                IIF ( mm.ignicao = 1, 'Ligado', 'Desligado') as ignicao,
                IIF ( mm.ignicao = 1, '#00EB00', '#FF0322' ) as statusVeic,
                mm.tensao,
                mm.ODEMETER_TOTAL as odometro,
                cv.idCategoria AS categoria,
                cc.pinPadrao,
                e.eventDesc as tecnologia
            FROM movimento_mt2000 as mm
                JOIN cadastro_veiculo cv ON cv.placa = mm.placa
                LEFT JOIN eventos_globais e ON e.id = mm.evento
                LEFT JOIN cliente_cadastro cc ON cc.id = mm.idCliente
            WHERE datalength(mm.longitude) > 0
                AND datalength(mm.latitude) > 0
                AND mm.placa = '${place}'
                AND mm.dataGPS = '${date}'
            ORDER BY datagps DESC
        `)
    }
    
    async command(date: string, commandName: string, place: string, idClient: number, idUser: number, command: string, serial: string) {
        await this.connection.query(`
            INSERT INTO
                semaforo_mt2000 (data, comandoNome, placa,idClienteLog,idUsuarioLog, comando ,serial)
                VALUES ('${date}','${commandName}','${place}', ${idClient}, ${idUser}, '${command}', ${serial})    
        `)
        .then( async (res) => {
            if (res.rowsAffected > 0) {
                await this.connection.query(`
                    INSERT INTO
                        bkp_semaforo_mt2000 (data, comandoNome, placa,idClienteLog,idUsuarioLog, comando ,serial)
                        VALUES ('${date}','${commandName}','${place}', ${idClient}, ${idUser}, '${command}', ${serial})  
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
            FROM bkp_semaforo_mt2000 mm
                INNER JOIN new_usuario b ON b.idUsuario = mm.idUsuarioLog
            WHERE mm.placa in ('${places}')
                AND mm.data BETWEEN '${dateI}' AND '${dateF}'
            ORDER BY data DESC   
        `)
    }
}
