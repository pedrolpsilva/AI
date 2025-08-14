import { IsNotEmpty, IsString } from "class-validator";

export class updateDto {
    @IsNotEmpty()
    @IsString()
    id: string
    @IsNotEmpty()
    @IsString()
    name: string
    @IsNotEmpty()
    @IsString()
    lat: string
    @IsNotEmpty()
    @IsString()
    lon: string
    @IsNotEmpty()
    @IsString()
    radius: string
}