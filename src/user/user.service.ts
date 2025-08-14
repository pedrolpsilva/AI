import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectDataSource() private readonly connection: DataSource
    ){}

    async verifyUser(cpfcnpj: string) {
        const user = await this.connection.query(`
            SELECT * FROM new_usuario WHERE cpfcnpj = '${cpfcnpj}' and ativo = 1
        `)

        if (user.length > 0) {
            return true
        } else {
            return false
        }
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

    getNumbers(cpfcnpj: string) {
        return this.connection.query(`
            SELECT
                cc.numeroCelular,
                cc.nome
            FROM cliente_cadastro c
                LEFT JOIN cliente_celulares cc ON cc.idCliente = c.id
            WHERE c.cpfcnpj = '${cpfcnpj}'
                AND c.ativo = 1  
        `)
    }

    async updateUser(name: string, pass: string, email: string, cpfcnpj: string) {
        try {
            await this.connection.query(`
                UPDATE new_usuario 
                SET
                    nome = '${name}',
                    senha = '${pass}',
                    email = '${email}'
                WHERE cpfcnpj = '${cpfcnpj}'    
            `) 
            return true
        } catch (err) {
            return false
        }
    }

    async updatePass(cpfcnpj: string, newPass: string) {
        try {
            await this.connection.query(`
                UPDATE new_usuario
                SET senha='${newPass}'
                WHERE cpfcnpj='${cpfcnpj}'
            `)
            return true
        } catch (err) {
            return false
        }
    }
}
