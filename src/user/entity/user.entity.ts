import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nome: string

    @Column()
    email: string

    @Column()
    cpfcnpj: string

    @Column()
    senha: string

    @Column()
    ativo: number

    @Column()
    perfil_usuario_vizualizacao: number
}