import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationService {
    constructor(@InjectDataSource() private readonly connection: DataSource){}

    verify(user: number) {
        return this.connection.query(`
            SELECT 
                id,
                IIF (CustomTitle IS NULL, idEvento, CustomTitle) AS evento,
                IIF (bodyEvento IS NULL, null, bodyEvento) AS descEvento,
                IIF (CustomTitle IS NULL, placa, 'TOTAL TRAC') AS placa,
                IIF (CustomTitle IS NULL, null, CustomBody) AS msg,
                idCliente,
                FORMAT(CAST(dataGPS AS DATETIME), 'dd/MM/yyyy HH:mm:ss') AS dataGPS,
                idUsuario,
                IIF (CustomTitle IS NOT NULL, 0,
                    IIF (bodyEvento IS NULL, 1, 2)
                ) AS tipo,
                localizacao
            FROM notificacoes 
            WHERE idUsuario='${user}' 
            ORDER BY dataGPS DESC
        `)
    }

    verifyPlace(user: number, place: string) {
        return this.connection.query(`
            SELECT 
                id,
                idEvento,
                bodyEvento,
                idCliente,
                placa,
                dataGPS,
                CustomTitle,
                CustomBody,
                idUsuario,
                localizacao
            FROM notificacoes 
            WHERE idUsuario='${user}' 
                AND placa='${place}'
            ORDER BY dataGPS DESC
        `)
    }

    async delNotification(id: number) {
        return this.connection.query(`
            DELETE FROM notificacoes WHERE id=${id}
        `)
    }

    async delAllNotification(idUser: number) {
        return this.connection.query(`
            DELETE FROM notificacoes WHERE idUsuario=${idUser}
        `)
    }

    async admNotification(body: string, tittle: string, date: any) {
        let fcms = []
        
        const users = await this.connection.query(`
            SELECT
                idUsuario
            FROM new_usuario
            ORDER BY idUsuario ASC
        `)

        for (let i = 0; i < users.length; i++) {
            await this.connection.query(`
                INSERT INTO notificacoes (dataGPS, CustomTitle, CustomBody, idUsuario) VALUES ('${date}', '${tittle}', '${body}', '${users[i].idUsuario}')
            `)

            const usersFcms = await this.connection.query(`
                SELECT
                    fcm
                FROM login_app
                WHERE idUsuario=${users[i].idUsuario}
            `) 

            fcms.push(usersFcms)
        }
        
        return fcms[0]
    }

    async internalAdmNotification(body: string, tittle: string, date: any) {
        let fcms = []
        const users = [1268, 21, 1491]

        for (let i = 0; i < users.length; i++) {
            if (users[i] == 1268 || users[i] == 21 || users[i] == 1491) {
                await this.connection.query(`
                    INSERT INTO notificacoes (dataGPS, CustomTitle, CustomBody, idUsuario) VALUES ('${date}', '${tittle}', '${body}', '${users[i]}')
                `)

                const usersFcms = await this.connection.query(`
                    SELECT
                        fcm
                    FROM login_app
                    WHERE idUsuario=${users[i]}
                `) 

                fcms.push(usersFcms)
            }

        }
        
        return fcms[0]
    }
}
