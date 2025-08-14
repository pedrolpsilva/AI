import { IsNotEmpty, IsString } from "class-validator";

export class updateUserDto {
    @IsNotEmpty()
    @IsString()
    cpfcnpj: string
    @IsNotEmpty()
    @IsString()
    email: string
    @IsNotEmpty()
    @IsString()
    pass: string
    @IsNotEmpty()
    @IsString()
    name: string
}