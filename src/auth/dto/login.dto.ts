import { IsNotEmpty, IsString } from "class-validator";

export class loginUserDto {
    @IsNotEmpty()
    @IsString()
    cpfcnpj: string
    @IsNotEmpty()
    @IsString()
    pass: string
}