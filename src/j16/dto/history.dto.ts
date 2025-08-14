import { IsNotEmpty, IsString } from "class-validator";

export class historyDto {
    @IsNotEmpty()
    @IsString()
    place: string
    @IsNotEmpty()
    @IsString()
    dateI: string
    @IsNotEmpty()
    @IsString()
    dateF: string
}