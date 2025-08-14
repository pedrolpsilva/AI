import { DataSource } from "typeorm"
import sendNotification from "./sendNotification"

export default async function brokenAnchor(bd: any) {
    const sql = bd.get(DataSource)

    await sql.query(`
        WITH Base AS (
            SELECT
                a.placa,
                a.latidute AS ancoraLatitude,
                a.longitude AS ancoraLongitude,
                IIF ( a.tipoRaio = 'km', a.raio,
                    IIF ( LEN(a.raio) = 1, '0.00' + a.raio,
                        IIF ( LEN(a.raio) = 2, '0.0' + a.raio,
                                IIF ( LEN(a.raio) = 3, '0.' + a.raio, NULL
                            )
                        )
                    )
                ) AS raio,
                m.descModelo,
                mr.descMarca,
                ROW_NUMBER() OVER (PARTITION BY a.placa ORDER BY a.dataGPS DESC) AS RowNumber
            FROM ancora a
                LEFT JOIN cadastro_veiculo cv ON cv.placa = a.placa
                LEFT JOIN cadastro_rastreador cr ON cr.serial = cv.serial
                LEFT JOIN modelo m ON m.id = cr.idModelo
                LEFT JOIN marca mr ON mr.id = m.idMarca
            WHERE a.ancorado = 1
                AND cv.serial IS NOT NULL AND cr.idModelo IS NOT NULL
        ),
        Result AS (
            SELECT
                b.placa,
                b.raio,
                (6371 * ACOS(
                    COS( RADIANS( b.ancoraLatitude)) * 
                    COS( RADIANS( IIF( SUBSTRING( b.descMarca, 1, 2) = 'VL', CAST(mm.latitude AS FLOAT) * -1, CAST(mm.latitude AS FLOAT)))) * 
                    COS( RADIANS( b.ancoraLongitude) - RADIANS( IIF( SUBSTRING( b.descMarca, 0, 2) = 'VL', CAST(mm.longitude AS FLOAT) * -1, CAST(mm.longitude AS FLOAT)))) + 
                    SIN( RADIANS( b.ancoraLatitude)) * 
                    SIN( RADIANS( IIF( SUBSTRING( b.descMarca, 1, 2) = 'VL', CAST(mm.latitude AS FLOAT) * -1, CAST(mm.latitude AS FLOAT))))
                )) AS distancia,
                mm.dataGPS,
                mm.idCliente,
                ROW_NUMBER() OVER (PARTITION BY mm.placa ORDER BY mm.dataGPS DESC) AS RowNumber
            FROM Base b 
                LEFT JOIN (
                    SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, idCliente
                    FROM movimento_suntech_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, idCliente
                    FROM movimento_suntech_st390_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, idCliente
                    FROM movimento_suntech_frontend_410
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, idCliente
                    FROM movimento_teltonika_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, idCliente
                    FROM movimento_teltonika4g_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, idCliente
                    FROM movimento_mt2000_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, idCliente
                    FROM movimento_grcad_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, msasDataServidor AS dataGPS, idCliente
                    FROM movimento_gv57_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, msasDataServidor AS dataGPS, idCliente
                    FROM movimento_gv75_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, id_cliente AS idCliente
                    FROM movimento_j16_frontend
                    UNION ALL SELECT
                        placa, CAST (latitude AS FLOAT) AS latitude, CAST (longitude AS FLOAT) AS longitude, dataGPS, id_cliente AS idCliente
                    FROM movimento_vl01_frontend
                    UNION ALL SELECT
                        placa, latitude * -1 AS latitude, longitude * -1 AS longitude, dataGPS, id_cliente AS idCliente
                    FROM movimento_vl02_frontend
                    UNION ALL SELECT
                        placa, latitude * -1 AS latitude, longitude * -1 AS longitude, dataGPS, id_cliente AS idCliente
                    FROM movimento_vl03_frontend
                ) AS mm ON mm.placa = b.placa 
            WHERE b.RowNumber = 1
        )

        SELECT
            r.placa,
            FORMAT(DATEADD (HOUR, CAST(- 0 AS INTEGER), r.dataGPS), 'dd/MM/yyyy HH:mm:ss' ) AS dataGPS,
            IIF( r.distancia > r.raio, 'true', 'false') rompeu,
            r.raio,
            r.distancia,
            r.idCliente
        FROM Result r WHERE r.RowNumber = 1 AND r.distancia IS NOT NULL
    `)
    .then(async (result) => {
        let msgsTemp = [], msgs = []
        for (let i = 0; i < result.length; i++) {
            await sql.query(`
                SELECT     
                    DISTINCT avu.id_usuario as idUsuario,
                    cv.placa,
                    la.fcm
                FROM cadastro_veiculo cv
                    INNER JOIN assoc_veiculos_usuarios avu ON avu.id_veiculo = cv.id
                    LEFT JOIN login_app la ON la.idUsuario = avu.id_usuario
                    INNER JOIN assoc_veiculo av ON av.placa = cv.placa
                WHERE cv.placa = '${result[i].placa}'
                AND avu.id_usuario > 1
                AND la.fcm IS NOT NULL
            `)
            .then(async (result2) => {
                for (let y = 0; y < result2.length; y++) {
                    await msgsTemp.push({
                        placa: result[i].placa,
                        fcm: result2[y].fcm,
                        idUsuario: result2[y].idUsuario,
                        idCliente: result[i].idCliente,
                        dataGPS: result[i].dataGPS,
                        idEvento: result[i].rompeu == 'true' ? '\u2693 Âncora violada' : '\u2693 Âncora reestabelecida',
                        bodyEvento: `\uD83D\uDE97 Veículo ${result[i].placa} ${result[i].rompeu == 'true' ? 'violou a âncora estabelecida' : 'voltou à âncora estabelecida'} no dia ${(result[i].dataGPS).substring(0,10)} as ${(result[i].dataGPS).substring(11,19)} \nEsta âncora tem um raio de ${(result[i].raio).replace('.',',')}Km`
                    })
                }
            })
        }
        
        let places = []
        for (let i = 0; i < msgsTemp.length; i++) {
            if (places.find((x) => x == msgsTemp[i].placa)) {
            } else {
                await sql.query(`
                    SELECT TOP 1 * FROM notificacoes WHERE placa = '${msgsTemp[i].placa}' AND idEvento like '%${(msgsTemp[i].idEvento).substring('1', (msgsTemp[i].idEvento).length)}%' ORDER BY id DESC 
                `)
                .then(async(result3) => {
                    if (result3.length == 0) {
                        const listMsgsTemp = msgsTemp.filter((x) => x.placa == msgsTemp[i].placa)
                        for (let y = 0; y < listMsgsTemp.length; y++) {
                            msgs.push(listMsgsTemp[y])
                        }

                        await sql.query(`
                            INSERT INTO notificacoes (dataGPS, idCliente, idEvento, idUsuario, placa, bodyEvento) VALUES ('${(msgs[0].dataGPS).substring(6,10)}-${(msgs[0].dataGPS).substring(3,5)}-${(msgs[0].dataGPS).substring(0,2)} ${(msgs[0].dataGPS).substring(11,19)}', '${msgs[0].idCliente}', N'${msgs[0].idEvento}', ${msgs[0].idUsuario}, '${msgs[0].placa}', N'${msgs[0].bodyEvento}')
                        `)
                        for (let y = 0; y < msgs.length; y++) {
                            await sendNotification(msgs[y].fcm, msgs[y].idEvento, msgs[y].bodyEvento, '1')
                        }
                    }
                })

                places.push(msgsTemp[i].placa)
            }
        }
        
    })
} 