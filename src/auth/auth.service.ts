import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(@InjectDataSource() private readonly connection: DataSource){}

    test() {
        return this.connection.query(`
            SELECT TOP 1 * FROM new_usuario
        `)
    }

    getUser(cpfcnpj: string) {
        return this.connection.query(`
            SELECT
                idUsuario,
                nome,
                idUsuario,
                senha,
                email,
                perfil_usuario_vizualizacao,
                ativo,
                senha
            FROM new_usuario
            WHERE cpfcnpj='${cpfcnpj}'
        `)
    }
    
    getUserClients(user: string) {
        return this.connection.query(`
            SELECT
                nome,
                cc.ativo,
                cc.id,
                pinPadrao
            FROM cliente_cadastro cc
                LEFT JOIN assoc_clientes_usuario ac
                    ON cc.id = ac.id_cliente
            WHERE ac.id_usuario = '${user}'
        `)
    }

    getUserClientsId(user: string) {
        return this.connection.query(`
            SELECT
                id_cliente
            FROM assoc_clientes_usuario
            WHERE id_usuario = '${user}'
        `)
    }
}
