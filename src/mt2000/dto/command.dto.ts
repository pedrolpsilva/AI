import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class commandDto {
    @IsNotEmpty()
    @IsString()
    command: string
    @IsNotEmpty()
    @IsString()
    commandName: string
    @IsNotEmpty()
    @IsString()
    serial: string
    @IsNotEmpty()
    @IsString()
    place: string
    @IsNotEmpty()
    @IsNumber()
    idClient: number
    @IsNotEmpty()
    @IsNumber()
    idUser: number
}