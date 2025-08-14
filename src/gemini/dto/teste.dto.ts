import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
export type arrayTest = {dataGPS: string, latitude: string, longitude: string, velocidade: string, ignicao: string, tensao: string, odometro: string, coords: {latitude: number, longitude: number}}

export class testeDto {
    @IsNotEmpty()
    @IsString()
    name?: string
    @IsNotEmpty()
    @IsString()
    command?: string
    @IsNotEmpty()
    @IsArray()
    infos: arrayTest[]
}