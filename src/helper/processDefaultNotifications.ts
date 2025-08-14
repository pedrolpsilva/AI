import { DataSource } from "typeorm"
import sendNotification from "./sendNotification"
const amqp = require('amqplib')
const queue = 'alertas_app'

export default async function processDefaultNotifications(bd: any) {
  const sql = bd.get(DataSource)
  let msgs = []
  const conection = await amqp.connect('amqp://total:total123@192.168.1.243')
  const channel = await conection.createChannel()
  await channel.assertQueue(queue)
  await channel.consume(queue, async (msg) => {   
    let a = msg.content.toString()
    let arrayTemp = {
      placa: String(a).substring(String(a).indexOf('+') + 1, String(a).indexOf('=')),
      idCliente: String(a).substring(String(a).indexOf('#') + 1, String(a).indexOf('$')),
      idEvento: String(a).substring(String(a).indexOf('%') + 1, String(a).indexOf('¨')),
      dataGPS: String(a).substring(String(a).indexOf('&') + 1, String(a).indexOf('*')),
    }
    if (arrayTemp.placa == 'SequelizeConnectionError: Failed to connect to 192.168.1.122:1433 - Could not connect (sequence)' || arrayTemp.placa == 'OXD7E78' || arrayTemp.placa == 'ERF3145' || arrayTemp.placa == 'PPL2072' || arrayTemp.placa == 'GGX5D78' || arrayTemp.placa == 'ERA8I69' || arrayTemp.placa == 'FUC4F78' || arrayTemp.placa == 'NSA0000' || arrayTemp.placa == 'EHY6F54' || arrayTemp.placa == 'LSO2260' || arrayTemp.placa == 'EGQ6B72' || arrayTemp.placa == 'DIG6G92' || arrayTemp.placa == 'DZI4C65' || arrayTemp.placa == 'FPJ5876' || arrayTemp.placa == 'GME8B57' || arrayTemp.placa == 'RRO7G61' || arrayTemp.placa == 'RTO0D40' || arrayTemp.placa == 'PWL3C88' || arrayTemp.placa == 'FRN1A96' || arrayTemp.placa == 'QXA7B51' ||arrayTemp.placa == 'RRU3A30' ||arrayTemp.placa == 'FBZ5F37' ||arrayTemp.placa == 'BRQ2I34' ||arrayTemp.placa == 'PXY0519' ||arrayTemp.placa == 'ECH4H68' ||arrayTemp.placa == 'LBN8400' ||arrayTemp.placa == 'FPH3G49' ||arrayTemp.placa == 'PZA5B24' ||arrayTemp.placa == 'QCB3016' ||arrayTemp.placa == 'OBE8247' ||arrayTemp.placa == 'QCJ5407' ||arrayTemp.placa == 'MFE8237' ||arrayTemp.placa == 'QTN1G25' ||arrayTemp.placa == 'FOW6989' ||arrayTemp.placa == 'FHL6410' ||arrayTemp.placa == 'BKU9A47' ||arrayTemp.placa == 'JBC5A24' ||arrayTemp.placa == 'HBZ2H30' ||arrayTemp.placa == 'GCX2I99' ||arrayTemp.placa == 'EZC4F04' ||arrayTemp.placa == 'LKO7271' ||arrayTemp.placa == 'DRA2H60' ||arrayTemp.placa == 'FUL7977' ||arrayTemp.placa == 'EJY8C87' ||arrayTemp.placa == 'GFW3394' ||arrayTemp.placa == 'CHA2191' ||arrayTemp.placa == 'RMD0001' ||arrayTemp.placa == 'GIJ7131' ||arrayTemp.placa == 'SDS8B98' ||arrayTemp.placa == 'EJG0010' ||arrayTemp.placa == 'GIM5J44') {
      channel.ack(msg)
    } else {
      msgs.push(arrayTemp)
      channel.ack(msg)
    }
  })
  await channel.close()
  await conection.close()

  for (let i = 0; i < msgs.length; i++) {
    await sql.query(`
      WITH Users AS (
        SELECT
          acu.id_cliente,
          acu.id_usuario,
          cv.placa
        FROM assoc_clientes_usuario acu
          LEFT JOIN assoc_veiculos_usuarios avu ON avu.id_usuario = acu.id_usuario
          LEFT JOIN cadastro_veiculo cv ON cv.id = avu.id_veiculo
        WHERE acu.id_cliente = ${msgs[i].idCliente}
          AND cv.placa IS NOT NULL
          AND cv.placa = '${msgs[i].placa}'
      )

      SELECT
        u.id_usuario,
        u.placa,
        l.fcm
      FROM Users u
        LEFT JOIN login_app l ON l.idUsuario = u.id_usuario
      WHERE CONVERT(DATETIME, l.data, 120) > DATEADD(day, -30, GETDATE())
    `)
    .then( async (res: {id_usuario: number, placa: string, fcm: string}[]) => {
      if (res.length > 0) {

        let user = []
        // console.log('1',res)
        for (let y = 0; y < res.length; y++) {
          // console.log('filter',user.filter(x => x.id_usuario === res[y].id_usuario))
          if (user.filter(x => x.id_usuario === res[y].id_usuario).length == 0) {
            // console.log(res[y].id_usuario)
            await sql.query(`
              INSERT INTO NOTIFICACOES (idEvento, idCliente, placa, dataGPS, idUsuario)
              VALUES ('${msgs[i].idEvento}', ${msgs[i].idCliente}, '${msgs[i].placa}', '${msgs[i].dataGPS}', ${res[y].id_usuario})
            `)
            // user.push(res[y].id_usuario)
          }
        }
        // console.log(user)
        
        for (let y = 0; y < res.length; y++) {
          let title = `${msgs[i].idEvento}!`
          let body = `O veículo com placa ${msgs[i].placa} gerou o evento: ${msgs[i].idEvento}.`
          await sendNotification(res[y].fcm, title, body, '1')
        }

      }
    })
  }
}