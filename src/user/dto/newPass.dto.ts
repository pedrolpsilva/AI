import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class newPassUserDto {
    @IsNotEmpty()
    @IsString()
    cpfcnpj: string
    @IsNotEmpty()
    @IsString()
    newPass: string
}