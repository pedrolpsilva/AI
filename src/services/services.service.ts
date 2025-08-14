import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ServicesService {
    constructor(
        @InjectDataSource() private readonly connection: DataSource
    ){}

    async updateLogin(user: string, fcm: string, date: string) {
        const lastUpdate: any = await this.connection.query(`SELECT id FROM login_app WHERE fcm='${fcm}'`)

        if (lastUpdate.length > 0) {
            this.connection.query(`
                UPDATE login_app
                SET
                    idUsuario='${user}',
                    data='${date}'
                WHERE fcm='${fcm}'
            `)
        } else {
            this.connection.query(`
                INSERT INTO login_app (fcm, idUsuario, data) VALUES ('${fcm}', ${user}, '${date}')
            `)
        }
        return true
    }

    async deleteLogin(fcm: string) {
        await this.connection.query(`
            DELETE FROM login_app WHERE fcm='${fcm}'
        `)
        return true
    }

    async verifyVersion(os: string, deviceVersion: string) {
        if (os == 'android') {
            var currentVersion = await this.connection.query(`SELECT versao FROM app_version`)
            return parseInt(currentVersion[0].versao.replaceAll('.','')) > parseInt(deviceVersion.replaceAll('.',''))
        } else {
            var currentVersion = await this.connection.query(`SELECT versaoIOS FROM app_version`)
            return parseInt(currentVersion[0].versaoIOS.replaceAll('.','')) > parseInt(deviceVersion.replaceAll('.',''))
        }
    }
}
