import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class insertDto {
    @IsNotEmpty()
    @IsNumber()
    clientId: number
    @IsNotEmpty()
    @IsString()
    name: string
    @IsNotEmpty()
    @IsString()
    clientName: string
    @IsNotEmpty()
    @IsString()
    lat: string
    @IsNotEmpty()
    @IsString()
    lon: string
    @IsNotEmpty()
    @IsString()
    radius: string
    @IsNotEmpty()
    @IsString()
    classification: string
}