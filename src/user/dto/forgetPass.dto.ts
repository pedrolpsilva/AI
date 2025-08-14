import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class forgetPassUserDto {
    @IsNotEmpty()
    @IsString()
    cpfcnpj: string
    @IsNotEmpty()
    @IsNumber()
    code: number
}