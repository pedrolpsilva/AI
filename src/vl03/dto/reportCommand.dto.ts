import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class reportCommandDto {
    @IsNotEmpty()
    @IsString()
    places: string
    @IsNotEmpty()
    @IsString()
    dateI: string
    @IsNotEmpty()
    @IsString()
    dateF: string
}