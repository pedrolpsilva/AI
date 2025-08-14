import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TruckService {
    constructor(@InjectDataSource() private readonly connection: DataSource) {}
    
    fuel(place: string) {
        return this.connection.query(`
            SELECT
                tipoCombustivel,
                valorCombustivel,
                kmLitroCombustivel
            FROM cadastro_veiculo
            WHERE placa='${place}'  
        `)
    }

    async fuelUpdate(type: string, value: string, km: string, place: string) {
        await this.connection.query(`
            UPDATE cadastro_veiculo
            SET
                tipoCombustivel = '${type}',
                valorCombustivel = '${value}',
                kmLitroCombustivel = '${km}'
            WHERE placa = '${place}'
        `)
        .then(res => {
            if (res.rowsAffected > 0) {
                return true
            } else {
                return false
            }
        })
        .catch(e => {return false})
    }

    regraOperacaoTrucks(places: string) {
        return this.connection.query(`
            SELECT
                DISTINCT rv.placa,
                ro.id,
                ro.nome,
                ro.temperatura,
                ro.temperatura2,
                ro.temperatura3,
                ro.temperatura4,
                ro.temperatura5,
                ro.temperatura6,
                ro.cor,
                ro.cor2,
                ro.cor3,
                ro.PintarMapa
            FROM regra_operacao ro
                LEFT JOIN regra_operacao_veiculos rv ON rv.id_regra_operacao = ro.id
            WHERE rv.placa in (${places})    
        `)
    }

    cadastroVeiculo(place: string) {
        console.warn(3)
        return this.connection.query(`
            SELECT
                *
            FROM cadastro_veiculos WHERE placa = '${place}'    
        `)
    }
}
