import { IsNotEmpty } from "class-validator";

export class verifyUserDto {
    @IsNotEmpty({ message: 'Preencha o cpf/cnpj' })
    cpfcnpj: string;
}