import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class insertAnchorDto {
    @IsNotEmpty()
    @IsString()
    idVehicle: string
    @IsNotEmpty()
    @IsNumber()
    user: number
    @IsNotEmpty()
    @IsString()
    place: string
    @IsNotEmpty()
    @IsString()
    idClient: string
    @IsNotEmpty()
    @IsString()
    location: string
    @IsNotEmpty()
    @IsString()
    type: string
    @IsNotEmpty()
    @IsString()
    radius: string
    @IsNotEmpty()
    @IsNumber()
    lat: number
    @IsNotEmpty()
    @IsNumber()
    lon: number
}