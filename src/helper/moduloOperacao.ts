import { DataSource } from "typeorm"
import sendNotification from "./sendNotification"

export default async function moduloOperacao(bd: any) {
    const sql = bd.get(DataSource)
    let tempTemperatureResult = []

    await sql.query(`
        WITH ModuloOperacao AS (
            SELECT
                DISTINCT rv.placa,
                ro.temperatura,
                ro.temperatura2,
                ro.temperatura3,
                ro.temperatura4,
                ro.temperatura5,
                ro.temperatura6
            FROM regra_operacao_veiculos rv
                LEFT JOIN regra_operacao ro ON ro.id = rv.id_regra_operacao
            WHERE
                (ro.temperatura != ''
                OR ro.temperatura2 != ''
                OR ro.temperatura3 != ''
                OR ro.temperatura4 != ''
                OR ro.temperatura5 != ''
                OR ro.temperatura6 != '')
                AND rv.placa IS NOT NULL
        ) 

        SELECT
            DISTINCT r.placa,
			cv.idCliente,
            r.temperatura,
            r.temperatura2,
            r.temperatura3,
            r.temperatura4,
            r.temperatura5,
            r.temperatura6,
            m.descModelo,
            mm.descMarca
        FROM ModuloOperacao r
            JOIN cadastro_veiculo cv ON cv.placa = r.placa
            LEFT JOIN cadastro_rastreador cr ON cr.serial = cv.serial
            LEFT JOIN modelo m ON m.id = cr.idModelo
            LEFT JOIN marca mm ON mm.id = cr.idMarca
        WHERE cv.serial IS NOT NULL
            AND mm.descMarca IS NOT NULL
    `)
    .then( async (res1) => {
        for (let i = 0; i < res1.length; i++) {
            switch (res1[i].descMarca) {
                case 'Suntech':
                    if (res1[i].descModelo == 'ST410') {
                        await sql.query(`
                            SELECT TOP 1 temperatura AS temperaturaAtual, idCliente, FORMAT(CAST(dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS, localizacao FROM movimento_suntech_frontend_410 WHERE placa = '${res1[i].placa}' AND temperatura IS NOT NULL AND temperatura != '' ORDER BY dataGPS DESC
                        `)
                        .then((res2) => {
                            if (res2[0] != undefined || res2[0]?.length == 1) {
                                tempTemperatureResult.push({
                                    placa: res1[i].placa,
                                    idCliente: res1[i].idCliente,
                                    dataGPS: res2[0].dataGPS,
                                    localizacao: res2[0].localizacao,
                                    temperaturaAtual: res2[0].temperaturaAtual,
                                    foraFaixa1: res2[0].temperaturaAtual >= res1[i].temperatura && res2[0].temperaturaAtual <= res1[i].temperatura2 ? false : true,
                                    foraFaixa2: res2[0].temperaturaAtual >= res1[i].temperatura3 && res2[0].temperaturaAtual <= res1[i].temperatura4 ? false : true,
                                    foraFaixa3: res2[0].temperaturaAtual >= res1[i].temperatura5 && res2[0].temperaturaAtual <= res1[i].temperatura6 ? false : true,
                                })
                            }
                        })
                    } else {
                        await sql.query(`
                            SELECT TOP 1 temperaturaS1 AS temperaturaAtual, idCliente, FORMAT(CAST(dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS, localizacao FROM movimento_suntech_frontend WHERE placa = '${res1[i].placa}' AND temperaturaS1 IS NOT NULL AND temperaturaS1 != '' ORDER BY dataGPS DESC
                        `)
                        .then((res2) => {
                            if (res2[0] != undefined || res2[0]?.length == 1) {
                                tempTemperatureResult.push({
                                    placa: res1[i].placa,
                                    idCliente: res1[i].idCliente,
                                    dataGPS: res2[0].dataGPS,
                                    localizacao: res2[0].localizacao,
                                    temperaturaAtual: res2[0].temperaturaAtual,
                                    foraFaixa1: res2[0].temperaturaAtual >= res1[i].temperatura && res2[0].temperaturaAtual <= res1[i].temperatura2 ? false : true,
                                    foraFaixa2: res2[0].temperaturaAtual >= res1[i].temperatura3 && res2[0].temperaturaAtual <= res1[i].temperatura4 ? false : true,
                                    foraFaixa3: res2[0].temperaturaAtual >= res1[i].temperatura5 && res2[0].temperaturaAtual <= res1[i].temperatura6 ? false : true,
                                })
                            }
                        })
                    }
                break
                case 'Teltonika':
                    if (res1.descModelo == 'Teltonika') {
                        await sql.query(`
                            SELECT TOP 1 temperaturaS2 AS temperaturaAtual, FORMAT(CAST(dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS, endereco AS localizacao FROM movimento_teltonika_frontend WHERE placa = '${res1[i].placa}' AND temperaturaS2 IS NOT NULL AND temperaturaS2 != '' ORDER BY dataGPS DESC
                        `)
                        .then((res2) => {
                            if (res2[0] != undefined || res2[0]?.length == 1) {
                                tempTemperatureResult.push({
                                    placa: res1[i].placa,
                                    idCliente: res1[i].idCliente,
                                    dataGPS: res2[0].dataGPS,
                                    localizacao: res2[0].localizacao,
                                    temperaturaAtual: res2[0].temperaturaAtual,
                                    foraFaixa1: res2[0].temperaturaAtual >= res1[i].temperatura && res2[0].temperaturaAtual <= res1[i].temperatura2 ? false : true,
                                    foraFaixa2: res2[0].temperaturaAtual >= res1[i].temperatura3 && res2[0].temperaturaAtual <= res1[i].temperatura4 ? false : true,
                                    foraFaixa3: res2[0].temperaturaAtual >= res1[i].temperatura5 && res2[0].temperaturaAtual <= res1[i].temperatura6 ? false : true,
                                })
                            }
                        })
                    } else {
                        await sql.query(`
                            SELECT TOP 1 temperaturaS2 AS temperaturaAtual, FORMAT(CAST(dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS, endereco AS localizacao FROM movimento_teltonika4g_frontend WHERE placa = '${res1[i].placa}' AND temperaturaS2 IS NOT NULL AND temperaturaS2 != '' ORDER BY dataGPS DESC
                        `)
                        .then((res2) => {
                            if (res2[0] != undefined || res2[0]?.length == 1) {
                                tempTemperatureResult.push({
                                    placa: res1[i].placa,
                                    idCliente: res1[i].idCliente,
                                    dataGPS: res2[0].dataGPS,
                                    localizacao: res2[0].localizacao,
                                    temperaturaAtual: res2[0].temperaturaAtual,
                                    foraFaixa1: res2[0].temperaturaAtual >= res1[i].temperatura && res2[0].temperaturaAtual <= res1[i].temperatura2 ? false : true,
                                    foraFaixa2: res2[0].temperaturaAtual >= res1[i].temperatura3 && res2[0].temperaturaAtual <= res1[i].temperatura4 ? false : true,
                                    foraFaixa3: res2[0].temperaturaAtual >= res1[i].temperatura5 && res2[0].temperaturaAtual <= res1[i].temperatura6 ? false : true,
                                })
                            }
                        })
                    }
                break
                case 'ST410':
                    await sql.query(`
                        SELECT TOP 1 temperatura AS temperaturaAtual, FORMAT(CAST(dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS, localizacao FROM movimento_suntech_frontend_410 WHERE placa = '${res1[i].placa}' AND temperatura IS NOT NULL AND temperatura != '' ORDER BY dataGPS DESC
                    `)
                    .then((res2) => {
                        if (res2[0] != undefined || res2[0]?.length == 1) {
                            tempTemperatureResult.push({
                                placa: res1[i].placa,
                                idCliente: res1[i].idCliente,
                                dataGPS: res2[0].dataGPS,
                                localizacao: res2[0].localizacao,
                                temperaturaAtual: res2[0].temperaturaAtual,
                                foraFaixa1: res2[0].temperaturaAtual >= res1[i].temperatura && res2[0].temperaturaAtual <= res1[i].temperatura2 ? false : true,
                                foraFaixa2: res2[0].temperaturaAtual >= res1[i].temperatura3 && res2[0].temperaturaAtual <= res1[i].temperatura4 ? false : true,
                                foraFaixa3: res2[0].temperaturaAtual >= res1[i].temperatura5 && res2[0].temperaturaAtual <= res1[i].temperatura6 ? false : true,
                            })
                        }
                    })
                break
                case 'VL02':
                    await sql.query(`
                        SELECT TOP 1 temperaturaS2 AS temperaturaAtual, FORMAT(CAST(dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS, endereco AS localizacao FROM movimento_vl02_frontend WHERE placa = '${res1[i].placa}' AND temperaturaS2 IS NOT NULL AND temperaturaS2 != '' ORDER BY dataGPS DESC
                    `)
                    .then((res2) => {
                        if (res2[0] != undefined || res2[0]?.length == 1) {
                            tempTemperatureResult.push({
                                placa: res1[i].placa,
                                idCliente: res1[i].idCliente,
                                dataGPS: res2[0].dataGPS,
                                localizacao: res2[0].localizacao,
                                temperaturaAtual: res2[0].temperaturaAtual,
                                foraFaixa1: res2[0].temperaturaAtual >= res1[i].temperatura && res2[0].temperaturaAtual <= res1[i].temperatura2 ? false : true,
                                foraFaixa2: res2[0].temperaturaAtual >= res1[i].temperatura3 && res2[0].temperaturaAtual <= res1[i].temperatura4 ? false : true,
                                foraFaixa3: res2[0].temperaturaAtual >= res1[i].temperatura5 && res2[0].temperaturaAtual <= res1[i].temperatura6 ? false : true
                            })
                        }
                    })
                break
            }
        }
    })
    
    let msgs = []
    for (let i = 0; i < tempTemperatureResult.length; i++) {
        if (!tempTemperatureResult[i].foraFaixa1 || !tempTemperatureResult[i].foraFaixa2 || !tempTemperatureResult[i].foraFaixa3) {
            msgs.push(
                {...tempTemperatureResult[i],
                    msgTittle: '\u2744 Temperatura excedida',
                    msgBody: `\uD83D\uDE97 Veículo ${tempTemperatureResult[i].placa} está com a temperatura excedida: ${tempTemperatureResult[i].temperaturaAtual}ºC`
                }
            )
        }
    }

    for (let i = 0; i < msgs.length; i++) {
        await sql.query(`
            SELECT
                clu.id_usuario AS idUsuario,
                cv.placa
            FROM assoc_clientes_usuario clu
                LEFT JOIN assoc_veiculos_usuarios vu ON vu.id_usuario = clu.id_usuario
                JOIN cadastro_veiculo cv ON cv.id = vu.id_veiculo
            WHERE
                clu.id_cliente = 160
                AND clu.id_usuario > 1
                AND cv.placa = '${msgs[i].placa}'
            ORDER BY clu.id_usuario ASC`)
        .then( async (res3) => {
            
            for (let y = 0; y < res3.length; y++) {
                if (res3[y].idUsuario == 1268) {
                    await sql.query(`
                        INSERT INTO NOTIFICACOES (idEvento, idCliente, placa, dataGPS, idUsuario, bodyEvento, localizacao)
                        VALUES (N'${msgs[i].msgTittle}', ${msgs[i].idCliente}, '${msgs[i].placa}', '${msgs[i].dataGPS}', ${res3[y].idUsuario}, N'${msgs[i].msgBody}', '${msgs[i].localizacao}')
                    `)
    
                    await sql.query(`
                        SELECT fcm FROM login_app WHERE idUsuario = ${res3[y].idUsuario}
                    `)
                    .then( async (res4) => {
                        for (let x = 0; x < res4.length; x++) {
                            await sendNotification(res4[x].fcm, msgs[i].msgTittle, msgs[i].msgBody, '2')
                        }
                    })
                }
            }

        })
    }
    
}